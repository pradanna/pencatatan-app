<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Models\HutangPiutang;
use Barryvdh\DomPDF\Facade\Pdf;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class LaporanHutangPiutangController extends Controller
{
    public function index()
    {


        // 1. Ambil Rekap Piutang (Uang kita di Customer)
        // Dikelompokkan berdasarkan customer (contact_id)
        $rekapPiutang = HutangPiutang::with('contact')
            ->where('jenis', 'PIUTANG') // Uang Masuk (Receivable)
            ->where('status', 'TAGIHAN_OPEN') // Hanya yang belum lunas
            ->select('contact_id', DB::raw('SUM(nominal) as total_hutang'))
            ->groupBy('contact_id')
            ->get();

        // 2. Ambil Rekap Hutang (Uang Supplier di Kita)
        // Dikelompokkan berdasarkan supplier (contact_id)
        $rekapHutang = HutangPiutang::with('contact')
            ->where('jenis', 'HUTANG') // Uang Keluar (Payable)
            ->where('status', 'TAGIHAN_OPEN') // Hanya yang belum lunas
            ->select('contact_id', DB::raw('SUM(nominal) as total_hutang'))
            ->groupBy('contact_id')
            ->get();

        // dd($rekapHutang);
        return Inertia::render('Laporan/HutangPiutang', [
            'rekapPiutang' => $rekapPiutang,
            'rekapHutang' => $rekapHutang,
            'totals' => [
                'totalPiutang' => $rekapPiutang->sum('total_hutang'),
                'totalHutang'  => $rekapHutang->sum('total_hutang'),
            ]
        ]);
    }

    // 1. API untuk mengambil detail transaksi (dipanggil via Axios di React)
    public function getDetail($contact_id, $jenis)
    {
        $transaksi = HutangPiutang::where('user_id', Auth::id())
            ->where('contact_id', $contact_id)
            ->where('jenis', $jenis)
            ->where('status', 'TAGIHAN_OPEN')
            ->orderBy('tanggal', 'desc')
            ->get();

        $contact = Contact::find($contact_id);

        return response()->json([
            'contact' => $contact,
            'transaksi' => $transaksi
        ]);
    }

    // 2. Fungsi Export (Print/PDF & Excel)
    public function export($contact_id, $jenis, $format)
    {
        // 1. Ambil Data
        $transaksi = HutangPiutang::with('contact')
            ->where('user_id', Auth::id())
            ->where('contact_id', $contact_id)
            ->where('jenis', $jenis)
            ->where('status', 'TAGIHAN_OPEN')
            ->orderBy('tanggal', 'asc')
            ->get();

        $contact = Contact::find($contact_id);
        $fileName = 'Laporan_' . $jenis . '_' . str_replace(' ', '_', $contact->name) . '_' . date('Ymd');

        // 2. Jika Format Excel (CSV)
        if ($format === 'excel') {
            $headers = [
                "Content-type" => "text/csv",
                "Content-Disposition" => "attachment; filename=$fileName.csv",
                "Pragma" => "no-cache",
                "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
                "Expires" => "0"
            ];
            $columns = ['Tanggal', 'Keterangan', 'Jatuh Tempo', 'Nominal'];
            $callback = function () use ($transaksi, $columns) {
                $file = fopen('php://output', 'w');
                fputcsv($file, $columns);
                foreach ($transaksi as $item) {
                    fputcsv($file, [$item->tanggal, $item->keterangan, $item->jatuh_tempo, $item->nominal]);
                }
                fclose($file);
            };
            return response()->stream($callback, 200, $headers);
        }

        // 3. Jika Format PDF (DOMPDF)
        if ($format === 'pdf') {
            $data = [
                'transaksi' => $transaksi,
                'contact' => $contact,
                'jenis' => $jenis,
                'total' => $transaksi->sum('nominal'),
                'tanggal_cetak' => now()->translatedFormat('d F Y'),
            ];

            // Load View khusus PDF
            $pdf = Pdf::loadView('exports.hutang-piutang-pdf', $data);

            // Set Ukuran Kertas A4
            $pdf->setPaper('a4', 'portrait');

            // stream() agar terbuka di browser dulu (bisa dipreview)
            // kalau mau langsung download ganti jadi ->download($fileName.'.pdf')
            return $pdf->stream($fileName . '.pdf');
        }
    }
}
