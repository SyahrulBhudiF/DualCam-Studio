import numpy as np
from helper.helper import format_number_and_round_numpy


class Quadran:
    def __init__(self, coorData):
        self.dataA = coorData[:, 4] # kolom ke-4 -> oX (arah gerak x) coorData adalah hasil dari kelas vektor dgn 6 kolom per blok
        self.dataB = coorData[:, 5] # kolom ke-5 -> oY (arah gerak y) dataA menyimpan nilai arah X, dan dataB menyimpan nilai arah Y

    def getQuadran(self):
        quadranData = np.empty((len(self.dataA), 6), dtype=object) # membuat array kosong quadranData untuk menyimpan hasil akhir

        for i in range(len(self.dataA)): # ambil arah pergerakan X dan Y dari setiap blok
            X = np.int_(self.dataA[i]) # konversi arah X ke integer
            Y = np.int_(self.dataB[i]) # konversi arah Y ke integer

            # # Cek apakah nilai X berada di dalam rentang yang diinginkan
            # if X < minimum_value or X > maximum_value:
            #     X = np.clip(self.dataA[i], minimum_value, maximum_value).astype(int)

            # # Cek apakah nilai Y berada di dalam rentang yang diinginkan
            # if Y < minimum_value or Y > maximum_value:
            #     Y = np.clip(self.dataB[i], minimum_value, maximum_value).astype(int)

            # print('Data getQuadran ' , i, ' : ', self.dataA[i])
            # print('Data x ' , i, ' : ', X, ' Tipe', type(X))
            # # Y = np.int_(self.dataB[i])
            # print('Data getQuadran ' , i, ' : ', self.dataB[i])
            # print('Data y ' , i, ' : ', Y, ' Tipe', type(Y))

            tetha = np.degrees(np.arctan2(Y, X)) + 360 * (Y < 0) # memberi susut vektor thdp sumbu X, np.degress : konversi radian ke derajat, jika Y < 0 tambahkan 360 agar semua sudut di rentang 0-360
            magnitude = np.sqrt(np.power(X, 2) + np.power(Y, 2)) # phytagoras menghitung besar vektor x dan y
            quadranLabel = ""

            if (X == 0) and (Y == 0): # jika tidak ada gerakan (vektor 0) maka tdk termasuk quadran
                quadranLabel = "No Quadran X Y = 0"
            else:
                if tetha >= 0 and tetha < 90:
                    quadranLabel = "Q1" # gerak ke kanan atas
                elif tetha >= 90 and tetha < 180:
                    quadranLabel = "Q2" # gerak ke kiri atas
                elif tetha >= 180 and tetha < 270:
                    quadranLabel = "Q3" # gerak ke kiri bawah
                elif tetha >= 270 and tetha < 360:
                    quadranLabel = "Q4" # gerak ke kanan bawah
                else:
                    quadranLabel = "No Quadran"
            quadranData[i, :] = [
                np.str_(i), # nomor urut blok
                X, # arah x
                Y, # arah y
                format_number_and_round_numpy(tetha),  # sudut tetha (dalam derajat)
                format_number_and_round_numpy(magnitude), # panjang vektor
                quadranLabel # label quadran
            ]
        return quadranData
