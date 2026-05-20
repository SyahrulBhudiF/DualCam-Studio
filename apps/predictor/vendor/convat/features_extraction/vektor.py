import numpy as np

class Vektor:
    def __init__(self, pocOutput, blockSize):
        self.poc = pocOutput[0] # nilai POC untuk setiap blok
        self.coorAwal = pocOutput[1] # koordinat awal dari masing-masing blok
        self.blockSize = blockSize # ukuran setiap blok 7x7

    def getVektor(self): # mengambil ukuran blok
        mb_x = self.blockSize  # panjang macroblock
        mb_y = self.blockSize  # lebar macroblock

        minimum_value = -self.blockSize/2 # digunakan untuk memastikan nilai vektor tidak diluar rentang blok
        maximum_value = self.blockSize/2

        cur_x = np.arange(0, mb_x) # mengakses indeks posisi dalam blok
        cur_y = np.arange(0, mb_y)

        nilTeng = np.int16(np.median(cur_x)) # sebagai acuan titik tengah pada POC
        medX = nilTeng + 1
        medY = nilTeng + 1

        rep_x = np.arange(-(nilTeng), medX)   # menghitung arah pergeseran dalam sumbu x dan y dari pusat blok
        rep_y = np.arange(nilTeng, -(medX), -1) 

        # output = np.empty((len(self.coorAwal), 6))
        output = np.zeros((len(self.coorAwal), 6)) # menyimpan hasil akhir, kolom 0-1 -> titik awal vektor, kolom 2-3 -> komponen vektor (delta x dan y), kolom 4-5 -> representasi arah pergeseran
        
        # print('len(self.coorAwal) : ', len(self.coorAwal))
        # print('Data Output Pertama (0) : ', output[0])

        valPOC = self.poc # perulangan setiap blok POC

        for i in range(valPOC.shape[2]):
            r = valPOC[:, :, i]
            
            val_max = np.max(np.max(r)) # menentukan posisi x dan y dari nilai korelasi tertinggi (gerakan paling mirip)
            temp_y, temp_x = np.where(r == np.max(r))
            
            if (len(temp_y) > 1 or len(temp_y) > 1) : # jika lebih dari 1 titik puncak ditemukan, pakai titik tengah (menghindari ambiguitas)
                temp_x = nilTeng
                temp_y = nilTeng
            else : # jika posisi gerak valid, ambil titik puncak yg ditemukan
                temp_x = temp_x[0]
                temp_y = temp_y[0]
                
                if temp_x != nilTeng or temp_y !=nilTeng: # cek apakah posisi ada di tengah (artinya terjadi pergerakan)
                    corX = self.coorAwal[i][0]  # koordinat X awal blok
                    corY = self.coorAwal[i][1]  # koordinat Y awal blok
                
                    tX = corX-medX
                    tY = corY-medY

                    oX = rep_x[cur_x[temp_x]] # arah gerak relatif (kanan/kiri/atas)
                    oY = rep_y[cur_y[temp_y]]

                    mX = (corX - (mb_x - temp_x)) # koordinat tujuan blok (titik akhir p2)
                    mY = (corY - (mb_y - temp_y))
                    
                    p1 = [tX, tY] # hitung komponen vektor sbg selisih posisi awal dan akhir
                    p2 = [mX, mY]
                    V = np.array(p2) - np.array(p1) # vektor = p2-p1

                    # # Cek apakah nilai X berada di dalam rentang yang diinginkan
                    # if oX < minimum_value or oX > maximum_value:
                    #     oX = np.clip(oX, minimum_value, maximum_value).astype(int)
                    
                    # # Cek apakah nilai Y berada di dalam rentang yang diinginkan
                    # if oY < minimum_value or oY > maximum_value:
                    #     oY = np.clip(oY, minimum_value, maximum_value).astype(int)
                    
                    output[i, 0] = p1[0] # x awal
                    output[i, 1] = p1[1] # y awal
                    output[i, 2] = V[0] # delta x
                    output[i, 3] = V[1] # delta y
                    output[i, 4] = oX # arah x relatif
                    output[i, 5] = oY # arah y relatif
        return output
