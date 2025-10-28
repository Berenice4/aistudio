
import React, { useState, useEffect } from 'react';
import { FunctionDeclaration, Type } from '@google/genai';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import Bars3Icon from './icons/Bars3Icon';

interface ToolEditorProps {
  tool: FunctionDeclaration | null;
  onSave: (tool: FunctionDeclaration) => void;
  onClose: () => void;
}

const emptyTool: FunctionDeclaration = {
  name: '',
  description: '',
  parameters: {
    type: Type.OBJECT,
    properties: {},
    required: [],
  },
};

const ToolEditor: React.FC<ToolEditorProps> = ({ tool, onSave, onClose }) => {
  const [currentTool, setCurrentTool] = useState<FunctionDeclaration>(emptyTool);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (tool) {
      setCurrentTool(JSON.parse(JSON.stringify(tool)));
    } else {
      setCurrentTool(emptyTool);
    }
    setValidationErrors({});
  }, [tool]);

  const handleRequiredChange = (paramName: string, isChecked: boolean) => {
    const required = currentTool.parameters?.required || [];
    const newRequired = isChecked 
      ? [...new Set([...required, paramName])]
      : required.filter(r => r !== paramName);

    setCurrentTool(prevTool => ({
      ...prevTool,
      parameters: {
        ...prevTool.parameters,
        required: newRequired,
      } as any
    }));
  };

  const handleParamChange = (index: number, field: string, value: string | boolean) => {
    const newTool = JSON.parse(JSON.stringify(currentTool));
    const properties = newTool.parameters.properties;
    const paramKeys = Object.keys(properties);
    const key = paramKeys[index];

    if (!key) return;

    if (field === 'name') {
        const newKey = (value as string).trim();
        if (newKey && newKey !== key) {
            const newProperties: { [k: string]: any } = {};
            Object.keys(properties).forEach(k => {
                if (k === key) {
                    newProperties[newKey] = properties[k];
                } else {
                    newProperties[k] = properties[k];
                }
            });
            newTool.parameters.properties = newProperties;
            newTool.parameters.required = (newTool.parameters.required || []).map((r: string) => r === key ? newKey : r);
            
            setValidationErrors(prev => {
              const newErrors = {...prev};
              if (newErrors[key]) {
                newErrors[newKey] = newErrors[key];
                delete newErrors[key];
              }
              return newErrors;
            });
        }
    } else if (field === 'isEnum') {
        if (value) {
            properties[key].enum = properties[key].enum || [];
        } else {
            delete properties[key].enum;
            setValidationErrors(prev => {
              const newErrors = {...prev};
              delete newErrors[key];
              return newErrors;
            });
        }
    } else if (field === 'enum') {
        const rawValue = value as string;
        const enumValues = rawValue.split(',').map(s => s.trim());
        const filteredEnumValues = enumValues.filter(v => v !== '');
        properties[key].enum = filteredEnumValues;

        const duplicates = [...new Set(filteredEnumValues.filter((item, i) => filteredEnumValues.indexOf(item) !== i))];
        
        setValidationErrors(prevErrors => {
            const newErrors = { ...prevErrors };
            if (duplicates.length > 0) {
                newErrors[key] = `Valori duplicati: ${duplicates.join(', ')}`;
            } else {
                delete newErrors[key];
            }
            return newErrors;
        });
    } else {
        properties[key][field] = value;
        if (field === 'type' && value !== Type.STRING) {
            delete properties[key].enum;
            setValidationErrors(prev => {
              const newErrors = {...prev};
              delete newErrors[key];
              return newErrors;
            });
        }
    }
    setCurrentTool(newTool);
};

  const addParam = () => {
    const newParamName = `param${Object.keys(currentTool.parameters?.properties || {}).length + 1}`;
    const newProperties = {
      ...(currentTool.parameters?.properties || {}),
      [newParamName]: { type: Type.STRING, description: '' }
    };
    setCurrentTool({ ...currentTool, parameters: { ...currentTool.parameters, properties: newProperties } as any });
  };
  
  const removeParam = (index: number) => {
    const properties = { ...currentTool.parameters?.properties };
    const keyToRemove = Object.keys(properties)[index];
    delete properties[keyToRemove];
    const newRequired = currentTool.parameters?.required?.filter(r => r !== keyToRemove) || [];
    setCurrentTool({ ...currentTool, parameters: { ...currentTool.parameters, properties, required: newRequired } as any });
    
    setValidationErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[keyToRemove];
        return newErrors;
    });
  };
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggedIndex(index);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      return;
    }
  
    const properties = currentTool.parameters?.properties || {};
    const params = Object.entries(properties);
    
    const [removed] = params.splice(draggedIndex, 1);
    params.splice(dropIndex, 0, removed);
    
    const newProperties = Object.fromEntries(params);
  
    setCurrentTool(prevTool => ({
      ...prevTool,
      parameters: {
        ...prevTool.parameters,
        properties: newProperties,
      } as any
    }));
  };
  
  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSave = () => {
    if (Object.keys(validationErrors).length > 0) return;
    onSave(currentTool);
    onClose();
  };

  const paramProperties = currentTool.parameters?.properties ? Object.entries(currentTool.parameters.properties) : [];
  const hasValidationErrors = Object.keys(validationErrors).length > 0;

  return (
    <div className="fixed inset-0 bg-gray-950 bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg shadow-2xl p-6 w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-white">{tool ? 'Modifica Strumento' : 'Aggiungi Nuovo Strumento'}</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400">Nome Funzione</label>
            <input type="text" value={currentTool.name} onChange={(e) => setCurrentTool({ ...currentTool, name: e.target.value })} className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">Descrizione</label>
            <textarea value={currentTool.description} onChange={(e) => setCurrentTool({ ...currentTool, description: e.target.value })} rows={2} className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary" />
          </div>

          <div className="border-t border-gray-700 pt-4">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-white">Parametri</h3>
                <button onClick={addParam} className="flex items-center gap-1 text-sm bg-primary text-white py-1 px-3 rounded-md hover:bg-primary-hover transition-colors">
                    <PlusIcon className="w-4 h-4" /> Aggiungi
                </button>
            </div>
            
            <div className="space-y-4">
              {paramProperties.map(([key, value], index) => (
                <div 
                  key={key}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`bg-gray-800 p-3 rounded-lg border border-gray-700 flex items-start gap-3 transition-opacity ${draggedIndex === index ? 'opacity-30' : 'opacity-100'}`}
                >
                  <div className="pt-2 cursor-move text-gray-500 hover:text-gray-300">
                    <Bars3Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input type="text" value={key} placeholder="Nome Parametro" onChange={e => handleParamChange(index, 'name', e.target.value)} className="bg-gray-900 border-gray-600 rounded-md p-2 focus:ring-primary focus:border-primary" />
                        <select value={(value as any).type} onChange={e => handleParamChange(index, 'type', e.target.value)} className="bg-gray-900 border-gray-600 rounded-md p-2 focus:ring-primary focus:border-primary">
                          {/* FIX: Explicitly type 't' as string to resolve TypeScript inference error. */}
                          {Object.values(Type).filter(t => t !== Type.TYPE_UNSPECIFIED && t !== Type.OBJECT && t !== Type.ARRAY && t !== Type.NULL).map((t: string) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <button onClick={() => removeParam(index)} className="text-gray-400 hover:text-red-500 p-1"><TrashIcon className="w-5 h-5" /></button>
                    </div>
                    
                    <textarea value={(value as any).description} placeholder="Descrizione Parametro" onChange={e => handleParamChange(index, 'description', e.target.value)} rows={2} className="w-full bg-gray-900 border-gray-600 rounded-md p-2 focus:ring-primary focus:border-primary" />
                    
                    {(value as any).type === Type.STRING && (
                        <div className="pt-2">
                          <div className="bg-gray-900 p-3 rounded-md border border-gray-700">
                              <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`isEnum-${key}`}
                                    checked={!!(value as any).enum}
                                    onChange={e => handleParamChange(index, 'isEnum', e.target.checked)}
                                    className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-primary focus:ring-primary cursor-pointer"
                                />
                                <label htmlFor={`isEnum-${key}`} className="ml-3 text-sm text-gray-200 cursor-pointer select-none">Definisci come Enum</label>
                              </div>
                              {!!(value as any).enum && (
                                <div className="mt-3">
                                    <label htmlFor={`enum-values-${key}`} className="block text-xs text-gray-400 mb-1">Valori consentiti (separati da virgola)</label>
                                    <textarea
                                        id={`enum-values-${key}`}
                                        value={((value as any).enum || []).join(', ')}
                                        placeholder="es. valore1, valore2, valore3"
                                        onChange={e => handleParamChange(index, 'enum', e.target.value)}
                                        rows={2}
                                        className={`w-full bg-gray-950 border rounded-md p-2 focus:ring-primary focus:border-primary text-sm ${validationErrors[key] ? 'border-red-500' : 'border-gray-600'}`}
                                    />
                                    {validationErrors[key] && <p className="text-red-500 text-xs mt-1">{validationErrors[key]}</p>}
                                </div>
                              )}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              ))}
              {paramProperties.length === 0 && <p className="text-gray-500 text-center py-4">Nessun parametro definito.</p>}
            </div>
          </div>
          
          {paramProperties.length > 0 && (
            <div className="border-t border-gray-700 pt-4">
              <h3 className="text-lg font-semibold text-white mb-3">Parametri Richiesti</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.keys(currentTool.parameters?.properties || {}).map((key, index) => (
                    <label key={`req-${index}`} htmlFor={`required-${key}`} className="flex items-center bg-gray-800 p-2 rounded-md cursor-pointer hover:bg-gray-700 border border-transparent hover:border-gray-600 transition-colors">
                        <input
                            type="checkbox"
                            id={`required-${key}`}
                            checked={currentTool.parameters?.required?.includes(key)}
                            onChange={(e) => handleRequiredChange(key, e.target.checked)}
                            className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-primary focus:ring-primary cursor-pointer"
                        />
                        <span className="ml-3 text-sm text-gray-200 truncate" title={key}>{key}</span>
                    </label>
                ))}
              </div>
            </div>
          )}

        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button onClick={onClose} className="py-2 px-4 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors">Annulla</button>
          <button onClick={handleSave} disabled={hasValidationErrors} className="py-2 px-4 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">Salva Strumento</button>
        </div>
      </div>
    </div>
  );
};

export default ToolEditor;