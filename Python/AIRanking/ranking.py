from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn

app = FastAPI()

class ResponseModel(BaseModel):
    message: str

@app.get("/", response_model=ResponseModel)
async def get_response():
    return {"message": "Hello, this is your response from the API!"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)