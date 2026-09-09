export type EditorialArticle = {
  id: string;
  ai_title?: string | null;
  original_title?: string | null;
  ai_content?: string | null;
  category?: string | null;
  redirectToArticleId?: string;
  [key: string]: unknown;
};

const EDITORIAL_OVERRIDES: Record<string, Partial<EditorialArticle>> = {
  "c203e241-3ca5-424e-ac28-927477b1f7ce": {
    ai_title: "Costa fue internada por una infección y continúa en una habitación común",
    ai_content: "<p><strong>La humorista y panelista Costa fue internada de urgencia por una infección y, según la información publicada por Ámbito, evolucionó favorablemente: después de permanecer en terapia intensiva, continuaba en una habitación común bajo seguimiento médico.</strong></p>\n<h2>Qué se sabe sobre su estado de salud</h2>\n<p>La información disponible señala que Costa atravesó una infección que requirió atención médica intensiva. La propia artista explicó que una bacteria, el neumococo, llegó a la sangre y provocó la infección. Esa declaración permite precisar el cuadro comunicado públicamente, aunque no reemplaza un parte médico ni aporta todos los detalles clínicos.</p>\n<p>Durante una parte de la internación permaneció en terapia intensiva. Luego fue trasladada a una habitación común, un cambio compatible con una evolución favorable, aunque no equivale por sí solo al alta médica. La nota de Ámbito no informó una fecha de egreso ni un plazo definitivo de recuperación.</p>\n<h2>La explicación de Costa</h2>\n<p>La panelista llevó tranquilidad sobre su evolución y expresó: “Ahora estoy mucho mejor”. También agradeció la atención recibida por el personal de salud. Sus declaraciones son la principal referencia directa incorporada en la información pública sobre su estado.</p>\n<h2>Qué está confirmado y qué no</h2>\n<p>Está confirmado por la información publicada que Costa fue internada, que pasó parte de la internación en terapia intensiva y que posteriormente se encontraba en una habitación común. También está consignada su explicación sobre una infección vinculada con el neumococo.</p>\n<p>No hay, en cambio, un parte médico completo publicado en la fuente consultada que detalle todos los estudios realizados, el tratamiento indicado, el diagnóstico diferencial o la fecha del alta. Por eso, cualquier versión adicional debe tomarse con cautela hasta que exista una comunicación directa de la artista, su entorno o el centro de salud.</p>\n<h2>Fuente y fecha de actualización</h2>\n<p>Esta actualización se elaboró a partir de la información publicada por <a href=\"https://www.ambito.com/espectaculos/la-humorista-costa-fue-internada-urgencia-que-le-paso-y-como-sigue-su-salud-n6320110\" rel=\"nofollow noopener noreferrer\">Ámbito</a>. El contenido de esta nota distingue entre los hechos comunicados y los datos que todavía no fueron confirmados públicamente. Si aparece un parte nuevo o una declaración directa, la información deberá actualizarse.</p>\n<p><em>Este artículo informa sobre un caso de interés público y no ofrece diagnósticos ni recomendaciones médicas.</em></p>",
    category: "Cultura",
  },
  "33def08a-a5cc-4328-b1fc-c9acd2caa002": {
    ai_title: "Resultados de la Quiniela Nacional y Provincial del martes 8 de septiembre: resumen de sorteos",
    ai_content: "<p><strong>La Quiniela Nacional y Provincial del martes 8 de septiembre de 2026 tuvo cinco sorteos: Previa, Primera, Matutina, Vespertina y Nocturna. Este artículo resume los primeros cinco puestos de cada extracción y enlaza la fuente consultada para verificar el listado completo.</strong></p>\n<h2>Resultados de la Quiniela Nacional</h2>\n<p><strong>Previa:</strong> 1.º 2637; 2.º 3045; 3.º 1170; 4.º 0857; 5.º 2462.</p>\n<p><strong>Primera:</strong> 1.º 3120; 2.º 7315; 3.º 5715; 4.º 4391; 5.º 2445.</p>\n<p><strong>Matutina:</strong> 1.º 5051; 2.º 6154; 3.º 0508; 4.º 2386; 5.º 7650.</p>\n<p><strong>Vespertina:</strong> 1.º 6094; 2.º 4903; 3.º 8125; 4.º 3845; 5.º 1364.</p>\n<p><strong>Nocturna:</strong> 1.º 8542; 2.º 1414; 3.º 9256; 4.º 8687; 5.º 7731.</p>\n<h2>Resultados de la Quiniela Provincial</h2>\n<p><strong>Previa:</strong> 1.º 5556; 2.º 8283; 3.º 3814; 4.º 9557; 5.º 0658.</p>\n<p><strong>Primera:</strong> 1.º 1059; 2.º 9333; 3.º 0899; 4.º 9570; 5.º 0861.</p>\n<p><strong>Matutina:</strong> 1.º 9993; 2.º 6794; 3.º 1599; 4.º 6662; 5.º 3244.</p>\n<p><strong>Vespertina:</strong> 1.º 6123; 2.º 5778; 3.º 8619; 4.º 7026; 5.º 4050.</p>\n<p><strong>Nocturna:</strong> 1.º 0204; 2.º 8037; 3.º 9223; 4.º 0730; 5.º 6580.</p>\n<h2>Cómo leer este resumen</h2>\n<p>Los números aparecen en el orden de llegada informado por la fuente. El cero inicial forma parte del resultado: por ejemplo, 0857 y 0204 deben conservarse con cuatro cifras. Este artículo no realiza pronósticos ni sugiere combinaciones para futuros sorteos.</p>\n<p>Para consultar los 20 puestos de cada sorteo, las letras de la Nacional y las actualizaciones publicadas durante la jornada, se puede revisar la <a href=\"https://www.ambito.com/informacion-general/quiniela-hoy-vivo-resultados-la-nacional-y-provincial-martes-8-septiembre-n6319685\" rel=\"nofollow noopener noreferrer\">cobertura original de Ámbito</a>. Los resultados deben verificarse también con el organismo oficial o la agencia correspondiente antes de reclamar un premio.</p>\n<p><em>Actualización: 8 de septiembre de 2026. Fuente principal: Ámbito.</em></p>",
    category: "Argentina",
  },
  "a4ad7453-1651-413b-93dd-d7e6d2a877f9": {
    ai_title: "Resultados de la Quiniela Nacional y Provincial del lunes 7 de septiembre: resumen de sorteos",
    ai_content: "<p><strong>La Quiniela Nacional y Provincial del lunes 7 de septiembre de 2026 registró cinco sorteos: Previa, Primera, Matutina, Vespertina y Nocturna. A continuación se resumen los primeros cinco puestos de cada extracción, con la fuente original para consultar el listado completo.</strong></p>\n<h2>Resultados de la Quiniela Provincial</h2>\n<p><strong>Previa:</strong> 1.º 6329; 2.º 6998; 3.º 9014; 4.º 5437; 5.º 0114.</p>\n<p><strong>Primera:</strong> 1.º 8790; 2.º 0009; 3.º 2260; 4.º 8247; 5.º 2780.</p>\n<p><strong>Matutina:</strong> 1.º 5192; 2.º 1062; 3.º 0648; 4.º 0855; 5.º 0453.</p>\n<p><strong>Vespertina:</strong> 1.º 6654; 2.º 0974; 3.º 4998; 4.º 6321; 5.º 9649.</p>\n<p><strong>Nocturna:</strong> 1.º 9051; 2.º 1939; 3.º 0997; 4.º 1986; 5.º 1191.</p>\n<h2>Resultados de la Quiniela Nacional</h2>\n<p><strong>Previa:</strong> 1.º 7556; 2.º 1349; 3.º 0853; 4.º 9829; 5.º 2523.</p>\n<p><strong>Primera:</strong> 1.º 2187; 2.º 4674; 3.º 1242; 4.º 1428; 5.º 2182.</p>\n<p><strong>Matutina:</strong> 1.º 8669; 2.º 8256; 3.º 4610; 4.º 3646; 5.º 1417.</p>\n<p><strong>Vespertina:</strong> 1.º 9209; 2.º 3060; 3.º 3313; 4.º 9301; 5.º 5175.</p>\n<p><strong>Nocturna:</strong> 1.º 2269; 2.º 9330; 3.º 1317; 4.º 6906; 5.º 4289.</p>\n<h2>Cómo leer este resumen</h2>\n<p>Los números se muestran en el orden de llegada comunicado por la fuente. Los ceros iniciales son parte del resultado: 0114, 0009 y 0648, por ejemplo, deben conservarse con cuatro cifras. Este artículo informa resultados ya publicados y no ofrece pronósticos ni combinaciones para próximos sorteos.</p>\n<p>Para consultar los 20 puestos de cada sorteo y las letras de la Nacional, se puede revisar la <a href=\"https://www.ambito.com/informacion-general/quiniela-hoy-vivo-resultados-la-nacional-y-provincial-lunes-7-septiembre-n6319225\" rel=\"nofollow noopener noreferrer\">cobertura original de Ámbito</a>. Antes de reclamar un premio, conviene verificar el extracto con el organismo oficial o la agencia correspondiente.</p>\n<p><em>Actualización: 7 de septiembre de 2026. Fuente principal: Ámbito.</em></p>",
    category: "Argentina",
  },
  "39a900ac-641e-410b-a06f-bb3622643767": {
    redirectToArticleId: "4307fa42-2983-4652-b6f1-758e0295b3e8",
  },
  "cb0787b5-846f-401b-8289-54e825650e04": {
    redirectToArticleId: "4307fa42-2983-4652-b6f1-758e0295b3e8",
  },
};

export function applyEditorialOverride<T extends EditorialArticle>(article: T): T {
  const override = EDITORIAL_OVERRIDES[article.id];
  return override ? { ...article, ...override } : article;
}

export function getEditorialOverride(id: string) {
  return EDITORIAL_OVERRIDES[id] || null;
}

export function shouldRedirectEditorialArticle(id: string) {
  return Boolean(EDITORIAL_OVERRIDES[id]?.redirectToArticleId);
}

export const EDITORIAL_OVERRIDE_IDS = Object.keys(EDITORIAL_OVERRIDES);
