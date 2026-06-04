import zipfile
import xml.etree.ElementTree as ET
import os

def docx_to_text(path):
    namespaces = {
        'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
    }
    with zipfile.ZipFile(path) as docx:
        tree = ET.parse(docx.open('word/document.xml'))
        root = tree.getroot()
        paragraphs = []
        for paragraph in root.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
            texts = [node.text for node in paragraph.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t') if node.text]
            if texts:
                paragraphs.append("".join(texts))
            else:
                paragraphs.append("")
        return "\n".join(paragraphs)

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    docx_path = os.path.join(current_dir, "ElIronico_Documento_Tecnico.docx")
    txt_path = os.path.join(current_dir, "ElIronico_Documento_Tecnico.txt")
    
    print(f"Leyendo: {docx_path}")
    try:
        text = docx_to_text(docx_path)
        with open(txt_path, 'w', encoding='utf-8') as f:
            f.write(text)
        print(f"¡Éxito! Archivo guardado en: {txt_path}")
    except Exception as e:
        print(f"Error: {e}")
