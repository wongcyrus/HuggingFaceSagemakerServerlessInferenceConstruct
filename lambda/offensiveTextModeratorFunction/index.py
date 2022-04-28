import os
import sagemaker

from sagemaker.huggingface.model import HuggingFaceModel, HuggingFacePredictor
from sagemaker.serverless import ServerlessInferenceConfig

sess = sagemaker.Session()


def inference(text):
    predictor = HuggingFacePredictor(
        endpoint_name=os.environ['huggingFaceodelEndpointName'], sagemaker_session=sess)
    data = {
        "inputs": text,
        "parameters": {
            'truncation': True,
            'max_length': 256,
            'padding': True,
        }
    }
    res = predictor.predict(data=data)
    print(res)


def lambda_handler(event, context):
    inference(event['text'])
    return 'OK'
