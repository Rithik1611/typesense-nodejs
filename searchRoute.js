const router = require('express').Router();
const typesenseClient = require('./typesenseClient');


router.get('/search', async (req, res) => {
  const query = req.query.q ?? '';
  const filters = req.query.filters;

  const searchParams = {
    q: query,
    query_by: 'title,authors', 
    per_page: 10,
    prefix: 'true',       
    num_typos: 2,         
  };

  if (filters) {
    searchParams.filter_by = filters;
  }

  try {
    const result = await typesenseClient
      .collections('books')
      .documents()
      .search(searchParams);

    res.status(200).json(result.hits);
  } catch (error) {
    console.error('Search Error:', error);
    res.status(500).json({ error: 'Search failed', details: error.message });
  }
});

router.get('/autocomplete', async (req, res) => {
  const query = req.query.q ?? '';

  if (!query.trim()) {
    return res.status(400).json({ error: 'Missing query (?q=...)' });
  }

  try {
    const result = await typesenseClient
      .collections('books')
      .documents()
      .search({
        q: query,
        query_by: 'title,authors', 
        prefix: 'required',                  
        num_typos: 1,
        highlight_full_fields: 'title,authors', 
      });

    const suggestions = result.hits.map(hit => ({
      id: hit.document.id,
      title: hit.document.title,
      authors: hit.document.authors,
      highlight: {
        title: hit.highlight?.title ?? null,
        authors: hit.highlight?.authors ?? null,
      }
    }));

    res.json(suggestions);
  } catch (error) {
    console.error('Autocomplete Error:', error);
    res.status(500).json({ error: 'Autocomplete failed', details: error.message });
  }
});

module.exports = router;
