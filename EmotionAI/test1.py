import cv2
from deepface import DeepFace


emotion_long_history = []
emotion_short_history = []


frame_compression = 1

# Load face cascade classifier
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
# Start capturing video
cap = cv2.VideoCapture(0)
while True:
    # Capture frame-by-frame
    ret, frame = cap.read()

    # Convert frame to grayscale
    gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Convert grayscale frame to RGB format
    rgb_frame = cv2.cvtColor(gray_frame, cv2.COLOR_GRAY2RGB)

    # Detect faces in the frame
    faces = face_cascade.detectMultiScale(gray_frame, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

    if len(faces) > 0:
        x, y, w, h = faces[0]
        # Extract the face ROI (Region of Interest)
        face_roi = rgb_frame[y:y + h, x:x + w]


        # Perform emotion analysis on the face ROI
        result = DeepFace.analyze(face_roi, actions=['emotion'], enforce_detection=False)
        emotion = result[0]['emotion']
        emotion['noFace'] = 0
        emotion_short_history.append(emotion)
        cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 0, 255), 2)
        cv2.putText(frame, f'{emotion}', (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 2)
    else:
        emotion_short_history.append({
            'angry': 0,
            'disgust': 0,
            'fear': 0,
            'happy': 0,
            'sad': 0,
            'surprise': 0,
            'neutral': 0,
            'noFace': 100
        })
        cv2.putText(frame, f'No face found', (100, 100), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 2)

    if len(emotion_short_history) >= 1:
        sum_emotions = {k: 0 for k in emotion_short_history[0].keys()}
        for emotion in emotion_short_history:
            for k, v in emotion.items():
                sum_emotions[k] += v
        dominant_emotion = max(sum_emotions, key=sum_emotions.get)
        emotion_short_history = []
        emotion_long_history.append((dominant_emotion, sum_emotions[dominant_emotion]/(frame_compression*100)))
        emotion_long_history = emotion_long_history[-20:]

    cv2.imshow('Real-time Emotion Detection', frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release the video capture object and close windows
cap.release()
cv2.destroyAllWindows()