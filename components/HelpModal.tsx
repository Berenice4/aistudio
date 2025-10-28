
import React from 'react';
import XIcon from './icons/XIcon';

interface HelpModalProps {
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-950 bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-2xl p-6 w-full max-w-3xl border border-gray-700 max-h-[90vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <XIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-white">Come Usare l'AI Agent Context Engineer</h2>
        <p className="text-gray-400 mb-6">
          Questo strumento ti aiuta a progettare e testare agenti AI configurando il loro "contesto"—le istruzioni e gli strumenti che usano per rispondere. Ecco alcuni esempi per iniziare.
        </p>

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-primary mb-2">Esempio 1: Bot Meteo Sarcastico</h3>
          <p className="text-gray-300 mb-4">
            Creiamo un agente che fornisce il meteo, ma con una personalità sarcastica. Definiremo uno strumento per permettergli di ottenere i dati meteorologici.
          </p>
          <ol className="list-decimal list-inside space-y-4 text-gray-300">
            <li>
              <strong>Imposta l'Istruzione di Sistema:</strong> Nel pannello "AI Agent Context Engineer", usa il modello "Assistente Sarcastico" o scrivi la tua istruzione, come:
              <pre className="bg-gray-800 p-2 rounded-md text-xs mt-2 text-gray-200 whitespace-pre-wrap">Sei un bot meteo sarcastico. Devi usare gli strumenti forniti per trovare il meteo, poi riportarlo con una forte dose di sarcasmo.</pre>
            </li>
            <li>
              <strong>Crea uno Strumento:</strong> Clicca su "Aggiungi" nella sezione "Strumenti" per aprire l'Editor di Strumenti. Definisci una funzione come questa:
              <div className="bg-gray-800 p-3 rounded-md text-xs mt-2 text-gray-200 space-y-1">
                <p><strong className="text-white">Nome Funzione:</strong> `get_weather`</p>
                <p><strong className="text-white">Descrizione:</strong> `Ottiene il meteo attuale per una data località.`</p>
                <p><strong className="text-white">Nome Parametro 1:</strong> `location`</p>
                <p><strong className="text-white">Tipo Parametro 1:</strong> `STRING`</p>
                <p><strong className="text-white">Descrizione Parametro 1:</strong> `La città e lo stato, es., San Francisco, CA`</p>
                <p>Assicurati di contrassegnare `location` come parametro <strong>richiesto</strong>.</p>
              </div>
            </li>
            <li>
              <strong>Chatta con l'Agente:</strong> Ora, chiedi all'agente il meteo nel pannello di chat.
              <pre className="bg-gray-800 p-2 rounded-md text-xs mt-2 text-gray-200">"Com'è il tempo a New York?"</pre>
            </li>
            <li>
              <strong>Osserva l'Ispettore:</strong> L'"Ispettore Agente" sulla destra mostrerà l'output grezzo del modello. Vedrai una `functionCall` in cui il modello chiede di usare il tuo strumento `get_weather` con l'argomento `location` che ha estratto. L'analisi AI criticherà quanto bene ha seguito le tue istruzioni.
            </li>
          </ol>
        </div>
        
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-primary mb-2">Esempio 2: Reporter di Notizie dell'Ultimo Minuto</h3>
          <p className="text-gray-300 mb-4">
            Per argomenti che richiedono informazioni attuali, la conoscenza integrata del modello potrebbe essere obsoleta. Usa l'ancoraggio con la Ricerca Google per risolvere questo problema.
          </p>
          <ol className="list-decimal list-inside space-y-4 text-gray-300">
            <li>
              <strong>Imposta l'Istruzione di Sistema:</strong>
              <pre className="bg-gray-800 p-2 rounded-md text-xs mt-2 text-gray-200 whitespace-pre-wrap">Sei un reporter di notizie. Le tue risposte devono basarsi sulle informazioni più recenti e verificabili dal web.</pre>
            </li>
            <li>
                <strong>Abilita Ancoraggio:</strong> Nella sezione "Ancoraggio", attiva "Ricerca Google". Nota che questo disabilita gli strumenti di Chiamata di Funzione e il caricamento di PDF, poiché non possono essere usati insieme.
            </li>
            <li>
              <strong>Fai una Domanda Attuale:</strong>
              <pre className="bg-gray-800 p-2 rounded-md text-xs mt-2 text-gray-200">"Chi ha vinto il premio per il miglior film agli ultimi Oscar?"</pre>
            </li>
            <li>
              <strong>Controlla le Fonti:</strong> L'agente risponderà usando le informazioni dalla Ricerca Google. L'"Ispettore Agente" mostrerà ora le "Fonti di Ancoraggio", elencando le pagine web che ha usato per formulare la risposta. Questo è cruciale per la verifica dei fatti.
            </li>
          </ol>
        </div>

        <div className="mb-2">
          <h3 className="text-xl font-semibold text-primary mb-2">Esempio 3: Analista di Documenti PDF</h3>
          <p className="text-gray-300 mb-4">
            Fornisci all'agente un contesto specifico caricando un documento PDF. L'agente baserà le sue risposte sulle informazioni contenute nel file.
          </p>
          <ol className="list-decimal list-inside space-y-4 text-gray-300">
            <li>
              <strong>Imposta l'Istruzione di Sistema:</strong>
              <pre className="bg-gray-800 p-2 rounded-md text-xs mt-2 text-gray-200 whitespace-pre-wrap">Sei un analista di documenti. Rispondi alle domande basandoti esclusivamente sulle informazioni fornite nei documenti PDF caricati. Se la risposta non è nel documento, dichiara che non puoi rispondere.</pre>
            </li>
            <li>
                <strong>Carica un PDF:</strong> Nella sezione "Ancoraggio", clicca su "File PDF di Contesto" e seleziona un PDF dal tuo computer. Puoi caricarne più di uno.
            </li>
            <li>
              <strong>Poni una Domanda sul Contenuto:</strong>
              <pre className="bg-gray-800 p-2 rounded-md text-xs mt-2 text-gray-200">"Riassumi il capitolo sull'implementazione della metodologia agile."</pre>
            </li>
            <li>
              <strong>Verifica la Risposta:</strong> L'agente genererà una risposta basata sul contenuto del PDF. Il tuo messaggio nella chat mostrerà il nome del file che hai allegato. L'Ispettore Agente non mostrerà fonti web, poiché il contesto è stato fornito direttamente da te.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;