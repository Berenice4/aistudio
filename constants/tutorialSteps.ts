
export interface TutorialStep {
  selector: string;
  title: string;
  content: string;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    selector: '#context-panel',
    title: "1. Pannello di Contesto dell'Agente",
    content: "Qui è dove si definisce il 'cervello' dell'agente AI. Puoi dargli una personalità, istruzioni e strumenti con cui lavorare."
  },
  {
    selector: '#system-instruction',
    title: "2. Istruzione di Sistema",
    content: "Questa è la direttiva principale per l'agente. Definisce la sua personalità, il suo scopo e i suoi vincoli. Prova a usare un modello dal menu a discesa!"
  },
  {
    selector: '#grounding-section',
    title: '3. Ancoraggio (Grounding)',
    content: "Abilita la Ricerca Google per permettere all'agente di accedere a informazioni aggiornate dal web, ideale per domande su eventi recenti."
  },
  {
    selector: '#tools-section',
    title: "4. Strumenti (Chiamata di Funzione)",
    content: "Definisci funzioni personalizzate che l'agente può utilizzare. Questo gli permette di interagire con API esterne o di eseguire compiti specifici."
  },
  {
    selector: '#chat-panel-messages',
    title: "5. Pannello di Chat",
    content: "Interagisci con il tuo agente qui. Invia messaggi e osserva come le tue configurazioni di contesto influenzano le sue risposte."
  },
  {
    selector: '#chat-input-form',
    title: "6. Invia un Messaggio",
    content: "Scrivi qui la tua richiesta e premi Invio o il pulsante di invio per avviare la conversazione."
  },
  {
    selector: '#debug-panel',
    title: "7. Ispettore Agente",
    content: "Analizza le risposte dell'agente. Puoi vedere la risposta grezza dell'API, le fonti di ancoraggio e un'analisi generata dall'AI sul suo comportamento."
  },
];
