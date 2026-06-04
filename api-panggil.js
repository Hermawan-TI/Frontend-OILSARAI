// Tampilkan nama file dan tombol prediksi saat file dipilih
document.addEventListener("DOMContentLoaded", function () {
    const input = document.getElementById("imageInput");
    const predictBtn = document.getElementById("predictBtn");
    const nameEl = document.getElementById("selectedFileName");

    if (input) {
        input.addEventListener("change", function () {
            if (input.files.length) {
                // Tampilkan nama file
                if (nameEl) {
                    nameEl.textContent = "File: " + input.files[0].name;
                    nameEl.style.display = "block";
                }
                // Tampilkan tombol prediksi
                if (predictBtn) {
                    predictBtn.style.display = "flex";
                }
            } else {
                // Sembunyikan jika tidak ada file
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

    // Tampilkan loading
    document.getElementById("loading").style.display = "block";
    document.getElementById("uploadArea").style.display = "none";
    document.getElementById("detectionResults").style.display = "none";

    const formData = new FormData();
    formData.append("file", file);

    try {

        const response = await fetch(
            "https://segmentation-api-test-citrachan-production.up.railway.app/predict",
            {
                method: "POST",
                body: formData
            }
        );

        if (!response.ok) {
            throw new Error("Server error: " + response.status);
        }

        const data = await response.json();
        console.log(data);

        /*
        Response:
        {
            "percentage": 20.4,
            "level": "Sedang",
            "mask": "iVBORw0KGgoAAA...",    <- base64
            "overlay": "iVBORw0KGgoAAA..."  <- base64
        }
        */

        // Model 1: U-Net → Coming Soon
        document.getElementById("unetImage").src = "";

        // Model 2: U-Net++ → Tampilkan mask dan overlay dari API
        document.getElementById("unetppMask").src  = "data:image/png;base64," + data.mask;
        document.getElementById("unetppImage").src = "data:image/png;base64," + data.overlay;

        // Model 3: DeepLabV3+ → Coming Soon
        document.getElementById("deeplabImage").src = "";

        // Tampilkan hasil
        document.getElementById("detectionResults").style.display = "flex";
        document.getElementById("resultInfo").style.display = "block";

    } catch (error) {

        console.error(error);
        alert("Gagal menghubungi API: " + error.message);
        resetDetection();

    } finally {

        document.getElementById("loading").style.display = "none";

    }
}

function resetDetection() {
    const input = document.getElementById("imageInput");
    if (input) input.value = "";

    const nameEl = document.getElementById("selectedFileName");
    if (nameEl) { nameEl.textContent = ""; nameEl.style.display = "none"; }

    const predictBtn = document.getElementById("predictBtn");
    if (predictBtn) predictBtn.style.display = "none";

    document.getElementById("unetImage").src = "";
    document.getElementById("unetppMask").src = "";
    document.getElementById("unetppImage").src = "";
    document.getElementById("deeplabImage").src = "";
    document.getElementById("resultInfo").style.display = "none";
    document.getElementById("detectionResults").style.display = "none";
    document.getElementById("uploadArea").style.display = "block";
}
