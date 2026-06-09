// ===== KONFIGURASI URL API =====
const API_URLS = {
    unet:    "https://apiunet-production.up.railway.app/predict",
    unetpp:  "https://segmentation-api-test-citrachan-production.up.railway.app/predict",
    deeplab: "https://backend-deeplapv3-production.up.railway.app/predict"
};

// Tampilkan nama file dan tombol prediksi saat file dipilih
document.addEventListener("DOMContentLoaded", function () {
    const input = document.getElementById("imageInput");
    const predictBtn = document.getElementById("predictBtn");
    const nameEl = document.getElementById("selectedFileName");

    if (input) {
        input.addEventListener("change", function () {
            if (input.files.length) {
                if (nameEl) {
                    nameEl.textContent = "File: " + input.files[0].name;
                    nameEl.style.display = "block";
                }
                if (predictBtn) predictBtn.style.display = "flex";
            } else {
                if (nameEl) nameEl.style.display = "none";
                if (predictBtn) predictBtn.style.display = "none";
            }
        });
    }
});

async function predict() {

    const fileInput = document.getElementById("imageInput");

    if (!fileInput.files.length) {
        alert("Pilih gambar terlebih dahulu");
        return;
    }

    const file = fileInput.files[0];

    // Tampilkan preview gambar yang diupload
    document.getElementById("originalPreview").src = URL.createObjectURL(file);

    document.getElementById("loading").style.display = "block";
    document.getElementById("uploadArea").style.display = "none";
    document.getElementById("detectionResults").style.display = "none";

    // Kirim ke 3 API secara paralel
    const makeFormData = () => { const fd = new FormData(); fd.append("file", file); return fd; };

    const [resUnet, resUnetpp, resDeeplab] = await Promise.allSettled([
        fetch(API_URLS.unet,    { method: "POST", body: makeFormData() }),
        fetch(API_URLS.unetpp,  { method: "POST", body: makeFormData() }),
        fetch(API_URLS.deeplab, { method: "POST", body: makeFormData() }),
    ]);

    // Parse response jika berhasil
    const parse = async (result) => {
        if (result.status === "fulfilled" && result.value.ok) {
            return await result.value.json();
        }
        return null;
    };

    const [dataUnet, dataUnetpp, dataDeeplab] = await Promise.all([
        parse(resUnet),
        parse(resUnetpp),
        parse(resDeeplab),
    ]);

    console.log("U-Net:", dataUnet);
    console.log("U-Net++:", dataUnetpp);
    console.log("DeepLabV3+:", dataDeeplab);

    // U-Net
    if (dataUnet) {
        document.getElementById("unetMask").src  = "data:image/png;base64," + dataUnet.mask;
        document.getElementById("unetImage").src = "data:image/png;base64," + dataUnet.overlay;
    }

    // U-Net++
    if (dataUnetpp) {
        document.getElementById("unetppMask").src  = "data:image/png;base64," + dataUnetpp.mask;
        document.getElementById("unetppImage").src = "data:image/png;base64," + dataUnetpp.overlay;
    }

    // DeepLabV3+
    if (dataDeeplab) {
        document.getElementById("deeplabMask").src  = "data:image/png;base64," + dataDeeplab.mask;
        document.getElementById("deeplabImage").src = "data:image/png;base64," + dataDeeplab.overlay;
    }

    document.getElementById("loading").style.display = "none";
    document.getElementById("detectionResults").style.display = "flex";
    document.getElementById("resultInfo").style.display = "block";
}

function resetDetection() {
    const input = document.getElementById("imageInput");
    if (input) input.value = "";

    const nameEl = document.getElementById("selectedFileName");
    if (nameEl) { nameEl.textContent = ""; nameEl.style.display = "none"; }

    const predictBtn = document.getElementById("predictBtn");
    if (predictBtn) predictBtn.style.display = "none";

    // Reset semua gambar
    ["unetMask","unetImage","unetppMask","unetppImage","deeplabMask","deeplabImage","originalPreview"]
        .forEach(id => { const el = document.getElementById(id); if (el) el.src = ""; });

    document.getElementById("resultInfo").style.display = "none";
    document.getElementById("detectionResults").style.display = "none";
    document.getElementById("uploadArea").style.display = "block";
}
