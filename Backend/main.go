package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

func handleAssessment(w http.ResponseWriter, r *http.Request) {
	// 1. Parse form, termasuk file dan value lainnya
	r.ParseMultipartForm(10 << 20)

	// 2. Ambil data value dari form
	username := r.FormValue("username")
	questionNumber := r.FormValue("questionNumber")

	// Validasi sederhana
	if username == "" || questionNumber == "" {
		http.Error(w, "Error: Username atau nomor soal tidak ada.", http.StatusBadRequest)
		return
	}

	// 3. Ambil file audio
	file, _, err := r.FormFile("audioFile")
	if err != nil {
		http.Error(w, "Error: Gagal mengambil file audio.", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// 4. Buat nama file yang dinamis, contoh: fahri_soal1.wav
	// Menggunakan strings.ToLower untuk membuat nama file konsisten (huruf kecil)
	filename := fmt.Sprintf("%s_soal%s.wav", strings.ToLower(username), questionNumber)

	// 5. Pastikan folder "uploads" ada, jika tidak maka buat folder tersebut
	uploadDir := "uploads"
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		http.Error(w, "Error: Tidak bisa membuat direktori uploads.", http.StatusInternalServerError)
		return
	}

	// 6. Buat file baru di dalam folder "uploads"
	newFilePath := filepath.Join(uploadDir, filename)
	newFile, err := os.Create(newFilePath)
	if err != nil {
		http.Error(w, "Error: Tidak bisa membuat file di server.", http.StatusInternalServerError)
		return
	}
	defer newFile.Close()

	// 7. Salin konten file yang di-upload ke file baru
	_, err = io.Copy(newFile, file)
	if err != nil {
		http.Error(w, "Error: Tidak bisa menyimpan konten file.", http.StatusInternalServerError)
		return
	}

	fmt.Printf("✅ File berhasil disimpan: %s\n", newFilePath)

	// TODO: Logika model ML Anda akan memproses file di 'newFilePath'
	simulatedScore := "Pronunciation Score: 87%"
	fmt.Fprintf(w, simulatedScore)
}

func main() {
    // ... Fungsi main tidak ada perubahan ...
	frontendDir := filepath.Join("..", "frontend")
	fs := http.FileServer(http.Dir(frontendDir))
	http.Handle("/", fs)
	http.HandleFunc("/assess", handleAssessment)
	port := "8080"
	fmt.Printf("✅ Server i-speak berjalan di http://localhost:%s\n", port)
	fmt.Printf("   Menyajikan file dari direktori: '%s'\n", frontendDir)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}