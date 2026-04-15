export const getTopKeywords = (data) => {
  const wordCount = {};
  const stopWords = [
    "the","and","is","at","which","on","for","with","as","by","to",
    "of","in","a","an","this","that","from","it","be","are"
  ];

  data.forEach(rfi => {
    if (!rfi.remarks) return;

    const words = rfi.remarks
      .toLowerCase()
      .replace(/[^a-z\s]/g, "")
      .split(" ");

    words.forEach(word => {
      if (word.length > 3 && !stopWords.includes(word)) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });
  });

  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10); // top 10
};