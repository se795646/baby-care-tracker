import { ref } from 'vue';

const globalRefs = ref({});

export default function useGlobalRefs() {
    function addRef(name, refValue) {
        globalRefs.value[name] = refValue;
    }

    function getRef(name) {
        return globalRefs.value[name] || null;
    }

    return { getRef, addRef };
}
