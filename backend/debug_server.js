
try {
    console.log('Attempting to import server...');
    import('./server.js')
        .then(() => console.log('Server imported successfully'))
        .catch(err => console.error('Import failed:', err));
} catch (err) {
    console.error('Synchronous error:', err);
}
