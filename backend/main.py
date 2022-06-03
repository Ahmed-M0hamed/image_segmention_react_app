from fastapi import FastAPI  , File , UploadFile 
from fastapi.middleware.cors import CORSMiddleware
from transformers import AutoFeatureExtractor, AutoModelForImageSegmentation , SegformerForSemanticSegmentation
from PIL import Image
from io import BytesIO
import tensorflow as tf  
import numpy as np 
import io
from starlette.responses import StreamingResponse
import cv2
import base64 
import matplotlib.pyplot as plt
import os 

origins = ['http://localhost:3000'] 

app = FastAPI() 

feature_extractor = AutoFeatureExtractor.from_pretrained("nvidia/segformer-b0-finetuned-ade-512-512")
model = SegformerForSemanticSegmentation.from_pretrained("nvidia/segformer-b0-finetuned-ade-512-512")



app.add_middleware(
    CORSMiddleware , 
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"], 
)



def segment(file) : 
    image = Image.open(BytesIO(file))
    image = image.resize ((400 , 400))
    features = feature_extractor(image , return_tensors='pt') 
    outputs = model(**features)  
    # get the mask 
    img = outputs.logits[0][1].detach().numpy() 
    # we saved the image first because cv2 can not read the image directly 
    plt.imsave('image.jpg' , img) 
    cvImage =  cv2.imread('image.jpg')
    res, im_png = cv2.imencode(".jpg", cvImage ) 
    im_bytes = im_png.tobytes()
    os.remove('./image.jpg')
    return im_bytes







@app.post('/predict/') 
async def predict( file: UploadFile = File(...)): 
    mask =   segment(await file.read()) 
    return StreamingResponse(io.BytesIO(mask), media_type="image/jpg") 