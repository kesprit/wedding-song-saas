'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import jsPDF from 'jspdf'

export default function ResultPage() {
  const searchParams = useSearchParams()
  const [lyrics, setLyrics] = useState('')
  const [prenom1, setPrenom1] = useState('')
  const [prenom2, setPrenom2] = useState('')
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  useEffect(() => {
    const rawLyrics = searchParams.get('lyrics')
    const p1 = searchParams.get('p1')
    const p2 = searchParams.get('p2')
    const audio = searchParams.get('audio')

    if (rawLyrics) setLyrics(decodeURIComponent(rawLyrics))
    if (p1) setPrenom1(decodeURIComponent(p1))
    if (p2) setPrenom2(decodeURIComponent(p2))
    if (audio) setAudioUrl(decodeURIComponent(audio))
  }, [searchParams])

  const downloadPDF = () => {
    const doc = new jsPDF()
    const margin = 20
    const maxLineWidth = 170
    let y = margin + 10

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(`Chanson de mariage : ${prenom1} & ${prenom2}`, margin, margin)

    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')

    const lines = lyrics.split('\n')
    lines.forEach(line => {
      if (line.startsWith('**') && line.endsWith('**')) {
        doc.setFont('helvetica', 'bold')
        doc.text(line.replace(/\*\*/g, ''), margin, y)
        doc.setFont('helvetica', 'normal')
        y += 8
      } else {
        const wrapped = doc.splitTextToSize(line, maxLineWidth)
        wrapped.forEach(subline => {
          if (y > 270) {
            doc.addPage()
            y = margin
          }
          doc.text(subline, margin, y)
          y += 8
        })
      }
      y += 5
    })

    doc.save(`chanson_${prenom1}_${prenom2}.pdf`)
  }

  const copyLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    alert('Lien copié dans le presse-papiers !')
  }

  if (!lyrics) return <p className="text-center mt-10">Chargement des paroles...</p>

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">🎶 Chanson de {prenom1} & {prenom2}</h1>

      <div className="whitespace-pre-wrap border p-4 rounded bg-gray-50 text-black mb-6">
        {lyrics}
      </div>

      {audioUrl ? (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2">🔊 Écoutez votre chanson</h2>
          <audio controls className="w-full">
            <source src={audioUrl} type="audio/mpeg" />
            Votre navigateur ne supporte pas la lecture audio.
          </audio>
        </div>
      ) : (
        <div className="mt-8 text-yellow-700 bg-yellow-100 border border-yellow-300 p-4 rounded">
          ⏳ La chanson est en cours de génération. Vous recevrez bientôt un lien pour l’écouter.
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-4">
        <button onClick={downloadPDF} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          📥 Télécharger en PDF
        </button>
        <button onClick={copyLink} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
          🔗 Copier le lien
        </button>
        <a
          href={`mailto:?subject=Notre chanson de mariage&body=Voici notre chanson personnalisée ❤️ : ${typeof window !== 'undefined' ? window.location.href : ''}`}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          ✉️ Envoyer par e-mail
        </a>
        <a
          href={`https://wa.me/?text=Découvre%20notre%20chanson%20de%20mariage%20🎶%20:%20${typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : ''}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          📤 Partager via WhatsApp
        </a>
      </div>
    </div>
  )
}
