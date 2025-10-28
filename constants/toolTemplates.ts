import { FunctionDeclaration, Type } from '@google/genai';

export interface ToolTemplate {
  name: string;
  template: FunctionDeclaration;
}

export const TOOL_TEMPLATES: ToolTemplate[] = [
  {
    name: "Ottenere Meteo",
    template: {
      name: 'get_weather',
      description: 'Ottiene il meteo attuale per una data località.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          location: {
            type: Type.STRING,
            description: 'La città e lo stato, es., San Francisco, CA',
          },
        },
        required: ['location'],
      },
    },
  },
  {
    name: "Ricerca Prodotti E-commerce",
    template: {
        name: 'search_products',
        description: 'Cerca prodotti in un catalogo e-commerce in base a una query e filtri.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                query: {
                    type: Type.STRING,
                    description: 'La query di ricerca per i prodotti, es., "scarpe da corsa".'
                },
                category: {
                    type: Type.STRING,
                    description: 'La categoria di prodotto da filtrare, es., "Abbigliamento".'
                },
                min_price: {
                    type: Type.NUMBER,
                    description: 'Il prezzo minimo dei prodotti da restituire.'
                },
                max_price: {
                    type: Type.NUMBER,
                    description: 'Il prezzo massimo dei prodotti da restituire.'
                }
            },
            required: ['query']
        }
    }
  },
  {
      name: "Inviare Email",
      template: {
          name: 'send_email',
          description: 'Invia un\'email a un destinatario specificato.',
          parameters: {
              type: Type.OBJECT,
              properties: {
                  recipient: {
                      type: Type.STRING,
                      description: 'L\'indirizzo email del destinatario.'
                  },
                  subject: {
                      type: Type.STRING,
                      description: 'L\'oggetto dell\'email.'
                  },
                  body: {
                      type: Type.STRING,
                      description: 'Il contenuto del corpo dell\'email.'
                  }
              },
              required: ['recipient', 'subject', 'body']
          }
      }
  },
  {
    name: "Gestione Prenotazioni",
    template: {
        name: 'manage_booking',
        description: 'Gestisce le prenotazioni dei clienti, come cancellare o riprogrammare appuntamenti.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                booking_id: {
                    type: Type.STRING,
                    description: 'L\'ID univoco della prenotazione da gestire.'
                },
                action: {
                    type: Type.STRING,
                    description: 'L\'azione da eseguire sulla prenotazione.',
                    enum: ['cancel', 'reschedule']
                },
                new_date_time: {
                    type: Type.STRING,
                    description: 'La nuova data e ora per la riprogrammazione, in formato ISO 8601. Richiesto solo per l\'azione "reschedule".'
                }
            },
            required: ['booking_id', 'action']
        }
    }
  },
  {
    name: "Ottenere Ultime Notizie",
    template: {
        name: 'get_latest_news',
        description: 'Recupera gli ultimi titoli di notizie su un argomento specifico.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                topic: {
                    type: Type.STRING,
                    description: 'L\'argomento per cui cercare le notizie, es., "tecnologia", "sport".'
                },
                language: {
                    type: Type.STRING,
                    description: 'La lingua delle notizie, es., "it" per italiano, "en" per inglese.',
                    enum: ['it', 'en', 'es', 'fr', 'de']
                }
            },
            required: ['topic']
        }
    }
  },
  {
    name: "Crea Evento Calendario",
    template: {
        name: 'create_calendar_event',
        description: 'Crea un nuovo evento nel calendario dell\'utente.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                title: {
                    type: Type.STRING,
                    description: 'Il titolo dell\'evento.'
                },
                start_time: {
                    type: Type.STRING,
                    description: 'L\'ora di inizio dell\'evento in formato ISO 8601.'
                },
                end_time: {
                    type: Type.STRING,
                    description: 'L\'ora di fine dell\'evento in formato ISO 8601.'
                },
                attendees: {
                    type: Type.STRING,
                    description: 'Un elenco di indirizzi email dei partecipanti, separati da virgola.'
                },
                location: {
                    type: Type.STRING,
                    description: 'La posizione dell\'evento.'
                }
            },
            required: ['title', 'start_time', 'end_time']
        }
    }
  }
];