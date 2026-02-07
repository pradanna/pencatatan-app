<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Laporan {{ $jenis }}</title>
    <style>
        body {
            font-family: sans-serif;
            font-size: 12px;
            color: #333;
            margin-top: 0cm;
            /* Sesuaikan jika kop surat terlalu mepet atas */
        }

        /* Style Khusus Kop Surat */
        .kop-surat {
            width: 100%;
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            /* Garis bawah kop (opsional) */
            padding-bottom: 10px;
        }

        .kop-surat img {
            width: 100%;
            /* Agar gambar memenuhi lebar kertas */
            height: auto;
            /* Agar proporsional */
            max-height: 150px;
            /* Batasi tinggi agar tidak memakan tempat */
            object-fit: contain;
            /* Agar gambar tidak gepeng */
        }

        /* ... Style tabel lainnya tetap sama ... */
        .info-table {
            width: 100%;
            margin-bottom: 20px;
        }

        .info-table td {
            padding: 3px;
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
        }

        .data-table th,
        .data-table td {
            border: 1px solid #ddd;
            padding: 8px;
        }

        .data-table th {
            background-color: #f4f4f4;
            text-align: left;
            font-weight: bold;
        }

        .text-right {
            text-align: right;
        }

        .text-center {
            text-align: center;
        }

        .font-bold {
            font-weight: bold;
        }

        .footer {
            margin-top: 30px;
            text-align: right;
            font-size: 10px;
            color: #888;
        }

        .status-box {
            background-color: #ffebee;
            color: #c62828;
            padding: 5px 10px;
            border-radius: 4px;
            font-weight: bold;
            display: inline-block;
        }
    </style>
</head>

<body>

    <div class="kop-surat">
        {{--
            CATATAN PENTING:
            1. Simpan gambar kop surat kamu di folder: public/images/kop.png
            2. Gunakan public_path() agar DOMPDF bisa membacanya tanpa error.
        --}}
        <img src="{{ public_path('images/kop-placeholder.png') }}" alt="Kop Surat Instansi">
    </div>

    <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="margin:0; text-transform: uppercase;">Laporan Rincian {{ $jenis }}</h2>
        <p style="margin:5px 0 0; font-size: 10px;">Dicetak pada: {{ $tanggal_cetak }}</p>
    </div>

    <table class="info-table">
        <tr>
            <td width="15%"><strong>Kepada Yth.</strong></td>
            <td width="2%">:</td>
            <td>{{ $contact->nama }}</td>
            <td width="20%" rowspan="3" class="text-right" style="vertical-align: top;">
                <div class="status-box">BELUM LUNAS</div>
            </td>
        </tr>
        <tr>
            <td><strong>No. HP</strong></td>
            <td>:</td>
            <td>{{ $contact->phone ?? '-' }}</td>
        </tr>
        <tr>
            <td><strong>Total Tagihan</strong></td>
            <td>:</td>
            <td class="font-bold">Rp {{ number_format($total, 0, ',', '.') }}</td>
        </tr>
    </table>

    <table class="data-table">
        <thead>
            <tr>
                <th width="5%" class="text-center">No</th>
                <th width="20%">Tanggal</th>
                <th>Keterangan Transaksi</th>
                <th width="20%">Jatuh Tempo</th>
                <th width="20%" class="text-right">Nominal</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($transaksi as $index => $item)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td>{{ \Carbon\Carbon::parse($item->tanggal)->format('d/m/Y') }}</td>
                    <td>{{ $item->keterangan }}</td>
                    <td>{{ $item->jatuh_tempo ? \Carbon\Carbon::parse($item->jatuh_tempo)->format('d/m/Y') : '-' }}
                    </td>
                    <td class="text-right">Rp {{ number_format($item->nominal, 0, ',', '.') }}</td>
                </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr>
                <td colspan="4" class="text-right font-bold" style="background-color: #fafafa;">TOTAL</td>
                <td class="text-right font-bold" style="background-color: #fafafa;">Rp
                    {{ number_format($total, 0, ',', '.') }}</td>
            </tr>
        </tfoot>
    </table>

    <div class="footer">
        <p>Dokumen ini digenerate secara otomatis oleh sistem.</p>
    </div>

</body>

</html>
