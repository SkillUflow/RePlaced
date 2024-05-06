import pandas as pd
from sklearn.model_selection import train_test_split
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Embedding, GlobalAveragePooling1D
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.utils import to_categorical
import xml.etree.ElementTree as ET
from PIL import Image
import base64
from io import BytesIO
import matplotlib.pyplot as plt

def encode_image_to_base64(image_path):
    # Load image
    with Image.open(image_path) as image:
        buffered = BytesIO()
        image.save(buffered, format="JPEG")
        return base64.b64encode(buffered.getvalue()).decode('utf-8')

def add_image_data_to_xml():
    # Create the root element
    root = ET.Element("data")

    while True:
        # User input for image file path and label
        image_path = input("Enter the path to the image file: ")
        label = input("Label the image (e.g., 'Cat', 'Dog', etc.): ")

        # Encode the image
        image_base64 = encode_image_to_base64(image_path)

        # Create a new entry element
        entry = ET.SubElement(root, "entry")
        ET.SubElement(entry, "image_data").text = image_base64
        ET.SubElement(entry, "label").text = label

        # Ask the user if they want to add more
        cont = input("Add another entry? (yes/no): ")
        if cont.lower() != 'yes':
            break

    # Write to XML file
    tree = ET.ElementTree(root)
    tree.write("encoded_image_data.xml")

    print("Data successfully saved to encoded_image_data.xml")

if __name__ == "__main__":
    add_image_data_to_xml()

def decode_base64_to_image(base64_string):
    image_data = base64.b64decode(base64_string)
    image = Image.open(BytesIO(image_data))
    return image

def load_encoded_images_from_xml(file_path):
    tree = ET.parse(file_path)
    root = tree.getroot()

    images = []
    labels = []

    for entry in root.findall('entry'):
        image_data = entry.find('image_data').text
        label = entry.find('label').text

        # Decode the base64 string to an image
        image = decode_base64_to_image(image_data)
        images.append(image)
        labels.append(label)

    return images, labels

# Example usage
images, labels = load_encoded_images_from_xml('encoded_image_data.xml')

# Display the first image and its label
plt.imshow(images[0])
plt.title(labels[0])
plt.show()

















# Data
data = {
    'Text': ['What is your name?', 'It is a sunny day.', 'How are you doing?', 'This is a great example.', 'Can you help me?', 'She enjoys reading books.'],
    'Label': ['Question', 'Statement', 'Question', 'Statement', 'Question', 'Statement']
}
df = pd.DataFrame(data)

# Convert labels to categorical
labels = pd.get_dummies(df['Label'])

# Tokenize text
tokenizer = Tokenizer(num_words=100)
tokenizer.fit_on_texts(df['Text'])
sequences = tokenizer.texts_to_sequences(df['Text'])
padded_sequences = pad_sequences(sequences, maxlen=10)

# Split data
X_train, X_test, y_train, y_test = train_test_split(padded_sequences, labels, test_size=0.33, random_state=42)

# Model
model = Sequential([
    Embedding(input_dim=100, output_dim=16, input_length=10),
    GlobalAveragePooling1D(),
    Dense(2, activation='softmax')
])

model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

# Train
model.fit(X_train, y_train, epochs=10, validation_data=(X_test, y_test))
