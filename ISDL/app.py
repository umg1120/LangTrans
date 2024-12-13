from flask import Flask,  request, jsonify, render_template
from transformers import MarianMTModel, MarianTokenizer

from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from transformers import TFAutoModelForSeq2SeqLM, DataCollatorForSeq2Seq


app=Flask(__name__) 

# Load the model and tokenizer
model_checkpoint1 = "Helsinki-NLP/opus-mt-en-hi"
tokenizer1 = AutoTokenizer.from_pretrained(model_checkpoint1)
model1 = TFAutoModelForSeq2SeqLM.from_pretrained("tf_model/")

model_checkpoint2 = "TestZee/FineTuned-hindi-to-english-V8"
tokenizer2 = AutoTokenizer.from_pretrained(model_checkpoint2)
model2 = AutoModelForSeq2SeqLM.from_pretrained(model_checkpoint2)

@app.route("/")
def home():
    return render_template('index.html')

@app.route("/translate", methods=['POST'])
def translate():
    input_text = request.form.get('input_text')
    input_language = request.form.get('input_language')
    output_language = request.form.get('output_language')
    # Print to verify data received
    print(f"Input Text: {input_text}")
    print(f"Input Language: {input_language}")
    print(f"Output Language: {output_language}")

    if(input_language == 'en' and output_language == 'hi'):
        tokenized = tokenizer1([input_text], return_tensors='tf')
        out = model1.generate(**tokenized, max_length=128)
        translation = tokenizer1.decode(out[0], skip_special_tokens=True)

    if(input_language == 'hi' and output_language == 'en'):
        tokenized = tokenizer2([input_text], return_tensors='pt', max_length=128, truncation=True, padding=True)
        out = model2.generate(**tokenized)
        translation = tokenizer2.decode(out[0], skip_special_tokens=True)
        

    if(input_language == 'en' and output_language == 'en'):
        translation = input_text

    if(input_language == 'hi' and output_language == 'hi'):
        translation = input_text
    
   
    
    # Respond with JSON
    return jsonify({"translated_text": translation})

if __name__=="__main__":
    app.run(debug=True)