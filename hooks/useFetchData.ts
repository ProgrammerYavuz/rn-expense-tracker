import React, { useEffect, useState } from 'react'
import { collection, onSnapshot, query, QueryConstraint } from 'firebase/firestore'
import { firestore } from '@/config/firebase';

/**
 * useFetchData:
 * - Firestore'dan belirli bir koleksiyondaki verileri gerçek zamanlı olarak dinleyen bir özel React Hook.
 * - `onSnapshot` kullanarak koleksiyonun güncellemelerini anlık olarak takip eder.
 * - Veriyi çeker, yüklenme durumunu yönetir ve hata durumlarını işler.
 * 
 * @template T - Koleksiyondaki belgelerin türü.
 * @param collectionName - Firestore'dan çekilecek koleksiyonun adı.
 * @param constraints - Firestore sorgusuna uygulanacak ek filtreleme kriterleri (opsiyonel).
 * @returns `{ data, loading, error }` şeklinde üç değeri döndürür.
 */

const useFetchData = <T>(
    collectionName: string, // Firestore koleksiyonunun adı
    constraints: QueryConstraint[] = [] // Firestore sorgusuna eklenebilecek filtreler (opsiyonel)
) => {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * useEffect:
     * - `collectionName` değiştiğinde çalışır.
     * - Firestore koleksiyonundan gerçek zamanlı veri çeker.
     * - `onSnapshot` ile veriler dinlenir ve her güncellemede `data` state'i güncellenir.
     */
    useEffect(() => {
        if(!collectionName) return; // Eğer koleksiyon adı belirtilmemişse işlem yapılmaz
        const collectionRef = collection(firestore, collectionName); // Firestore'dan ilgili koleksiyonun referansını alır
        const q = query(collectionRef, ...constraints); // Firestore sorgusunu oluşturur (eğer ek filtreleme varsa uygular)

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedData = snapshot.docs.map((doc) => {
                return {
                    id: doc.id,
                    ...doc.data()
                }
            }) as T[];
            setData(fetchedData);
            setLoading(false);
        }, (error) => {
            console.log('Veri yükleme sırasında hata oluştu:', error);
            setError(error.message);
            setLoading(false);
        });
        
        return () => unsubscribe();
        
    }, [collectionName]);
    
  return { data, loading, error };
}

export default useFetchData