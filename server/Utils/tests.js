function removeUer(associationName) {
    const test = associationName.replace('(ע"ר)', '').trim();
    return `*${test}*`
  }

function filterText(text) {
    const test = text.replace(/\(ע"ר\)/g, '').trim(); // Remove Hebrew registration mark   
    return `*${test}*`
}
  
  const associationName = 'עמותת(ע"ר)  חברים לעזרה(ע"ר) הדדית (ע"ר)'
  //מוזאיק המכון למדיניות- בינה מלאכותית (ע"ר)
  console.log(associationName);
  const test1 = removeUer(associationName);
  const test2 = filterText(associationName);
  console.log("test1: ", test1);
  console.log("test2: ", test2);