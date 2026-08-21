# Use Case Predict Video

Dokumen ini menjelaskan use case pada fitur **Predict Video**, yaitu fitur untuk mengunggah video wajah dan menampilkan hasil prediksi kecemasan berdasarkan video tersebut.

## Use Case Diagram

```mermaid
flowchart LR
	User([User]) --> UC((Melakukan Prediksi Kecemasan dari Video))
	UC --> System[Sistem]
```

## Activity Diagram

```mermaid
flowchart LR
	subgraph User
		direction TB
		A((Mulai))
		B[Masuk ke halaman prediksi video]
		D[Memilih video]
		G[Mengupload video]
		K[Menekan tombol mulai]
		M[Melihat detail hasil dan event]
	end

	subgraph Sistem
		direction TB
		C[Menampilkan halaman prediksi video]
		E{Video valid?}
		F[Menampilkan peringatan]
		H[Menyiapkan hasil prediksi]
		I{Hasil siap?}
		J[Menampilkan modal hasil siap]
		L[Menampilkan hasil prediksi pada video]
		N((Selesai))
	end

	A --> B
	B --> C
	C --> D
	D --> E
	E -- Tidak --> F
	F --> D
	E -- Ya --> G
	G --> H
	H --> I
	I -- Belum --> H
	I -- Ya --> J
	J --> K
	K --> L
	L --> M
	M --> N
```

## Rincian Use Case

| Atribut | Keterangan |
|---|---|
| Nama Use Case | Melakukan Prediksi Kecemasan dari Video |
| Aktor | User |
| Deskripsi | User mengunggah video wajah untuk diproses oleh sistem sehingga menghasilkan prediksi tingkat kecemasan. |
| Prekondisi | Aplikasi telah dibuka dan user berada pada halaman prediksi video. |
| Alur Utama | User memilih video → user mengupload video → sistem menyiapkan hasil prediksi → user menekan tombol mulai → sistem menampilkan hasil prediksi dan event pada video. |
| Alternatif | Jika file tidak valid atau upload gagal → sistem menampilkan peringatan. Jika pratinjau video tidak tersedia → video tetap dapat diupload dan dilihat pada halaman analisis. |
| Postkondisi | Hasil prediksi kecemasan, daftar event, dan chart analisis berhasil ditampilkan. |
