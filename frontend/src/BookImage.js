import React, { useEffect, useState } from "react";

const BookImage = ({ book }) => {
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchAndCacheImage = async () => {
      const cachedBlob = await loadImageFromIndexedDB(book.id);
      if (cachedBlob) {
        // Blob postoji u IndexedDB, pretvori u URL
        const url = URL.createObjectURL(cachedBlob);
        if (isMounted) setImageSrc(url);
      } else {
        try {
          // Učitaj s API-ja kao blob
          const response = await fetch(`/images/${book.image}`);
          const blob = await response.blob();
          if (isMounted) setImageSrc(URL.createObjectURL(blob));
          // Spremi blob u IndexedDB
          await saveImageToIndexedDB(book.id, blob);
        } catch (err) {
          console.error("Greška pri učitavanju slike:", err);
          if (isMounted) setImageSrc("/images/default-book.png");
        }
      }
    };

    fetchAndCacheImage();

    return () => {
      isMounted = false;
    };
  }, [book]);

  return (
    <img
      src={imageSrc || "/images/default-book.png"}
      alt={book.title}
      style={{ width: "100%", height: "auto", marginBottom: "0.5rem", borderRadius: "4px" }}
    />
  );
};
