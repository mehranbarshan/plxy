from fastapi import FastAPI
from pydantic import BaseModel
import asyncio
import json
from main import scrape_channel, client  # فرض می‌کنیم main.py اصلاح‌شده

app = FastAPI()

class ChannelRequest(BaseModel):
    channels: list[str]

@app.on_event("startup")
async def startup_event():
    await client.start()  # session از قبل آماده است

@app.post("/scrape")
async def scrape(request: ChannelRequest):
    results = await asyncio.gather(*(scrape_channel(ch) for ch in request.channels))
    return results
