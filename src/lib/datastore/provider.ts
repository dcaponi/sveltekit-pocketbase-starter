export interface IDataStoreProvider {
    searchRecordsBy<T>(tableName: string, fields: string, filter: string): Promise<T[]>
    createRecord<T>(tableName: string, record: {[key: string]: any;} | FormData): Promise<T | null>
    updateRecord<T>(tableName: string, id: string, record: {[key: string]: any;} | FormData): Promise<T | null>
  }