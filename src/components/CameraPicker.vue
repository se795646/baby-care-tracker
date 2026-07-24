<template>
    <div class="camera-picker">
        <div v-if="photoPreview" class="photo-preview-container bq-relative bq-mb-3">
            <img
                :src="photoPreview"
                class="photo-preview bq-w-full bq-rounded-8 bq-object-cover"
                style="max-height: 240px;"
                alt="寶寶相片"
            />
            <button
                type="button"
                class="remove-btn bq-absolute bq-top-2 bq-right-2 bq-bg-red-500 bq-text-white bq-rounded-full bq-w-8 bq-h-8 bq-flex bq-items-center bq-justify-center bq-shadow-md hover:bq-bg-red-600 bq-transition"
                @click="removePhoto"
            >
                ✕
            </button>
        </div>

        <div v-else class="camera-actions bq-flex bq-gap-3">
            <!-- 傳統相片上傳/手機原生相機拍照 -->
            <label
                class="upload-label bq-flex bq-items-center bq-justify-center bq-flex-1 bq-py-4 bq-px-4 bq-border-2 bq-border-dashed bq-border-gray-300 bq-rounded-8 bq-cursor-pointer hover:bq-bg-gray-50 bq-transition"
            >
                <span class="bq-text-sm bq-text-gray-600 bq-flex bq-items-center bq-gap-2">
                    <span class="mdi mdi-camera bq-text-xl"></span>
                    拍照 / 上傳照片
                </span>
                <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    class="bq-hidden"
                    @change="onFileChange"
                />
            </label>

            <!-- 即時 Web Camera 拍照按鈕 (如果瀏覽器支援 getUserMedia) -->
            <button
                v-if="hasWebcam"
                type="button"
                class="webcam-btn bq-flex bq-items-center bq-justify-center bq-py-4 bq-px-5 bq-bg-gray-100 hover:bq-bg-gray-200 bq-text-gray-800 bq-rounded-8 bq-transition"
                title="開啟視訊拍照"
                @click="openWebcam"
            >
                <span class="mdi mdi-webcam bq-text-xl"></span>
            </button>
        </div>

        <!-- Web Camera 即時拍照 Modal -->
        <v-dialog v-model="showWebcamModal" max-width="500px" persistent>
            <v-card class="bq-rounded-12">
                <v-card-title class="bq-flex bq-justify-between bq-items-center bq-p-4 bq-border-b">
                    <span class="bq-text-lg bq-font-medium">相機拍照</span>
                    <button
                        type="button"
                        class="bq-text-gray-500 hover:bq-text-gray-700"
                        @click="closeWebcam"
                    >
                        <span class="mdi mdi-close bq-text-xl"></span>
                    </button>
                </v-card-title>
                <v-card-text class="bq-p-4">
                    <div
                        class="video-container bq-relative bq-bg-black bq-rounded-8 bq-overflow-hidden bq-flex bq-items-center bq-justify-center"
                        style="height: 320px;"
                    >
                        <video
                            ref="videoRef"
                            autoplay
                            playsinline
                            class="bq-w-full bq-h-full bq-object-cover"
                        ></video>
                    </div>
                </v-card-text>
                <v-card-actions class="bq-p-4 bq-flex bq-justify-center bq-gap-3">
                    <button
                        type="button"
                        class="bq-bg-gray-100 hover:bq-bg-gray-200 bq-text-gray-700 bq-px-5 bq-py-2 bq-rounded-8 bq-font-bold bq-transition bq-text-sm"
                        @click="closeWebcam"
                    >
                        取消
                    </button>
                    <button
                        type="button"
                        class="bq-bg-pink-500 hover:bq-bg-pink-600 bq-text-white bq-px-5 bq-py-2 bq-rounded-8 bq-font-bold bq-transition bq-text-sm bq-shadow-sm"
                        @click="capturePhoto"
                    >
                        拍照
                    </button>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';


const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['update:modelValue', 'change']);

const photoPreview = ref(props.modelValue);
const hasWebcam = ref(false);
const showWebcamModal = ref(false);
const videoRef = ref(null);
let mediaStream = null;

// 檢查是否支援 Web Camera
onMounted(() => {
    photoPreview.value = props.modelValue;
    if (
        navigator.mediaDevices &&
        navigator.mediaDevices.getUserMedia
    ) {
        hasWebcam.value = true;
    }
});

// 組件銷毀前關閉相機串流
onBeforeUnmount(() => {
    stopCamera();
});

// 原生 input file 拍照/上傳處理
const onFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            // 自動壓縮圖片
            const base64 = compressImage(img);
            photoPreview.value = base64;
            emit('update:modelValue', base64);
            emit('change', base64);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
};

// 開啟相機
const openWebcam = async () => {
    showWebcamModal.value = true;
    // 延遲一下等待 DOM 渲染 video 標籤
    setTimeout(async () => {
        try {
            mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }, // 優先使用後置鏡頭
                audio: false
            });
            if (videoRef.value) {
                videoRef.value.srcObject = mediaStream;
            }
        } catch (err) {
            console.error('無法啟動相機: ', err);
            alert('無法開啟相機，請使用檔案上傳或檢查相機權限。');
            showWebcamModal.value = false;
        }
    }, 100);
};

// 關閉相機
const closeWebcam = () => {
    stopCamera();
    showWebcamModal.value = false;
};

const stopCamera = () => {
    if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
        mediaStream = null;
    }
    if (videoRef.value) {
        videoRef.value.srcObject = null;
    }
};

// 即時拍照
const capturePhoto = () => {
    if (!videoRef.value) return;

    const video = videoRef.value;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 建立臨時圖片對象，用來壓縮
    const img = new Image();
    img.onload = () => {
        const base64 = compressImage(img);
        photoPreview.value = base64;
        emit('update:modelValue', base64);
        emit('change', base64);
        closeWebcam();
    };
    img.src = canvas.toDataURL('image/jpeg');
};

// 刪除照片
const removePhoto = () => {
    photoPreview.value = '';
    emit('update:modelValue', '');
    emit('change', '');
};

// 圖片壓縮函數 (最大寬度/高度 800px, 壓縮比 0.7)
const compressImage = (img) => {
    const canvas = document.createElement('canvas');
    const MAX_WIDTH = 800;
    const MAX_HEIGHT = 800;
    let width = img.width;
    let height = img.height;

    if (width > height) {
        if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
        }
    } else {
        if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
        }
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);

    // 回傳壓縮後的 Base64 JPEG
    return canvas.toDataURL('image/jpeg', 0.7);
};
</script>

<style scoped>
/* 避免 global styles 衝突，採用 scoped */
</style>
