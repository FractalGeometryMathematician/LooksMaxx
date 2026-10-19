# Third-party assets

MediaPipe Tasks Vision 0.10.21: `vendor/vision_bundle.mjs`, `vendor/wasm/*`.
Source: https://www.npmjs.com/package/@mediapipe/tasks-vision/v/0.10.21
Project: https://github.com/google-ai-edge/mediapipe
License: Apache-2.0. See `vendor/LICENSE`.

Face Landmarker float16 model v1: `models/face_landmarker.task`.
Source: https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task
Documentation: https://developers.google.com/edge/mediapipe/solutions/vision/face_landmarker

No third-party fonts, analytics, remote portraits, or cloud inference calls.

Hair Segmenter float32 model v1: `models/hair_segmenter.tflite`.
Source: https://storage.googleapis.com/mediapipe-models/image_segmenter/hair_segmenter/float32/1/hair_segmenter.tflite
Documentation: https://developers.google.com/edge/mediapipe/solutions/vision/image_segmenter
This segments hair/background; broad hairstyle labels are app heuristics rather than model classes.
