import asyncio
import sys
import io
import json
import base64
import random
from datetime import datetime, timedelta, timezone
from pathlib import Path
import tiktoken
from telethon import TelegramClient, connection
from telethon.tl.functions.channels import GetFullChannelRequest
from telethon.errors import FloodWaitError
from pymongo import MongoClient

# ---------------- UTF-8 stdout & stderr ----------------
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8")
sys.stdout.reconfigure(line_buffering=True)

def log_status(message):
    sys.stderr.write(f"[{datetime.now().strftime('%H:%M:%S')}] {message}\n")
    sys.stderr.flush()

# ---------------- API ----------------
apiid = 30454960
api_hash = "348580f353e5525467a1cc7273e76b56"

# ---------------- MTProxy Logic ----------------
# سکرت دقیقا همان چیزی که فرستادید
SECRET_RAW = "eeNEgYdJvXrFGRMCIMJdCQtY2RueWVrdGFuZXQuY29tZmFyYWthdi5jb212YW4ubmFqdmEuY29tAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
PROXY_HOST = "184.174.98.165"
PROXY_PORT = 8770

# تابع کمکی برای حل مشکل Padding در Base64
def fix_base64_padding(s):
    return s + '=' * (-len(s) % 4)

proxy = None
connection_type = connection.ConnectionTcpAbridged

try:
    # 1. اصلاح پدینگ
    safe_secret = fix_base64_padding(SECRET_RAW)
    
    # 2. دیکود کردن Base64 به بایت
    secret_bytes = base64.b64decode(safe_secret)
    
    # 3. تبدیل بایت به رشته Hex (چیزی که Telethon نیاز دارد)
    secret_hex = secret_bytes.hex()
    
    proxy = (PROXY_HOST, PROXY_PORT, secret_hex)
    connection_type = connection.ConnectionTcpMTProxyAbridged
    log_status(f"✅ Proxy Configured: {PROXY_HOST}:{PROXY_PORT}")

except Exception as e:
    log_status(f"⚠️ Proxy Error: {e}")
    log_status("⚠️ Switching to DIRECT connection (No Proxy)...")
    proxy = None
    connection_type = connection.ConnectionTcpAbridged

# ---------------- SESSION & PATHS ----------------
# مسیر داینامیک برای جلوگیری از ارور در ویندوز
base_path = Path(__file__).parent.resolve()

session_dir = base_path / "sessions"
session_dir.mkdir(parents=True, exist_ok=True)
session_file = session_dir / "plxy.session"

profile_dir = base_path / "channel_profiles"
profile_dir.mkdir(parents=True, exist_ok=True)

# ---------------- TELETHON CLIENT ----------------
client = TelegramClient(
    str(session_file),
    apiid,
    api_hash,
    connection=connection_type,
    proxy=proxy,
)

# ---------------- MONGO ----------------
try:
    mongo_client = MongoClient("mongodb://mymongo:27017/mymongo", serverSelectionTimeoutMS=2000)
    db = mongo_client["telegram_scraper"]
    collection = db["channels"]
except:
    collection = None

# ---------------- CONFIG ----------------
DAYS_BACK = 3
MAX_TOKENS = 4096
CONCURRENCY_LIMIT = 3
tokenizer = tiktoken.get_encoding("gpt2")

def chunk_message(text: str):
    tokens = tokenizer.encode(text)
    if len(tokens) <= MAX_TOKENS:
        return [text]
    return [
        tokenizer.decode(tokens[i:i + MAX_TOKENS])
        for i in range(0, len(tokens), MAX_TOKENS)
    ]

async def get_channel_details_safe(entity):
    try:
        full = await client(GetFullChannelRequest(entity))
        about_text = getattr(full.full_chat, "about", "") or ""
        participants = await client.get_participants(entity, limit=0)
        return {
            "name": entity.title,
            "id": entity.id,
            "username": getattr(entity, "username", "") or "",
            "description": about_text,
            "subscribers": participants.total
        }
    except Exception as e:
        log_status(f"❌ Error getting details: {e}")
        return {
            "name": getattr(entity, "title", ""),
            "id": entity.id,
            "username": getattr(entity, "username", "") or "",
            "description": "",
            "subscribers": getattr(entity, "participants_count", 0)
        }

async def scrape_channel(channel_username: str, semaphore: asyncio.Semaphore):
    async with semaphore:
        try:
            log_status(f"🔄 Processing: {channel_username}")
            entity = await client.get_entity(channel_username)
            details = await get_channel_details_safe(entity)

            if entity.photo:
                photo_path = profile_dir / f"{entity.id}.jpg"
                if not photo_path.exists():
                    try:
                        await client.download_profile_photo(entity, file=str(photo_path))
                    except: pass
            
            await asyncio.sleep(random.uniform(1, 2))

            messages_list = []
            cutoff = datetime.now(tz=timezone.utc) - timedelta(days=DAYS_BACK)

            async for msg in client.iter_messages(entity, limit=150):
                if not msg.text or not msg.date: continue
                msg_date = msg.date.astimezone(timezone.utc)
                if msg_date < cutoff: break

                reply_to_id = msg.reply_to.reply_to_msg_id if (msg.is_reply and msg.reply_to) else None

                text_chunks = chunk_message(msg.text)
                for idx, chunk in enumerate(text_chunks):
                    messages_list.append({
                        "messageid": msg.id,
                        "date": msg_date.isoformat(),
                        "text": chunk,
                        "chunk_index": idx + 1,
                        "is_reply": msg.is_reply,
                        "reply_to_msg_id": reply_to_id
                    })

            channel_data = {
                "channelid": str(entity.id),
                "channel_username": channel_username,
                "name": details["name"],
                "description": details["description"],
                "subscribers": details["subscribers"],
                "avatar": f"/api/avatar/{entity.id}",
                "messages": messages_list,
                "scraped_at": datetime.now(timezone.utc).isoformat(),
            }

            if collection is not None:
                collection.update_one({"channelid": str(entity.id)}, {"$set": channel_data}, upsert=True)
            
            log_status(f"✅ Success: {details['name']}")
            return channel_data

        except Exception as e:
            log_status(f"❌ Error in {channel_username}: {e}")
            return None

async def main(channels):
    await client.connect()
    
    if not await client.is_user_authorized():
        try:
            await client.start()
        except EOFError:
            log_status("❌ Interaction required for login but failed.")
            return

    semaphore = asyncio.Semaphore(CONCURRENCY_LIMIT)
    tasks = [scrape_channel(ch, semaphore) for ch in channels]
    results = await asyncio.gather(*tasks)

    await client.disconnect()
    
    final_output = [r for r in results if r is not None]
    print(json.dumps(final_output, ensure_ascii=False))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps([]))
    else:
        asyncio.run(main(sys.argv[1:]))