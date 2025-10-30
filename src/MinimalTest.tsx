/**
 * ============= COMPONENT MÍNIM DE TEST =============
 * Aquest component serveix per verificar que React pot renderitzar correctament
 * No depèn de cap provider, context, ni llibreria externa
 */

export default function MinimalTest() {
  console.log('🟣 MinimalTest component renderitzant');
  console.log('🟣 React està executant-se correctament!');
  
  const testData = {
    timestamp: new Date().toISOString(),
    location: window.location.href,
    reactVersion: '18.3.1'
  };
  
  return (
    <div style={{
      color: 'white',
      fontSize: '16px',
      padding: '40px',
      backgroundColor: '#1a1a1a',
      minHeight: '100vh',
      fontFamily: 'monospace',
      lineHeight: '1.8'
    }}>
      <h1 style={{ 
        color: '#6ee7b7', 
        fontSize: '32px', 
        marginBottom: '20px',
        borderBottom: '2px solid #6ee7b7',
        paddingBottom: '10px'
      }}>
        ✅ React està viu i renderitza!
      </h1>
      
      <div style={{ 
        backgroundColor: '#065f46', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <p style={{ margin: '5px 0' }}>
          <strong>Timestamp:</strong> {testData.timestamp}
        </p>
        <p style={{ margin: '5px 0' }}>
          <strong>Location:</strong> {testData.location}
        </p>
        <p style={{ margin: '5px 0' }}>
          <strong>React Version:</strong> {testData.reactVersion}
        </p>
      </div>
      
      <div style={{
        backgroundColor: '#1e40af',
        padding: '20px',
        borderRadius: '8px',
        marginTop: '20px'
      }}>
        <p style={{ margin: '0', color: '#93c5fd' }}>
          ✅ Si veus aquest missatge, React funciona correctament.
          <br />
          ✅ El problema està en algun provider o component de l'aplicació.
        </p>
      </div>
      
      <div style={{
        marginTop: '30px',
        padding: '15px',
        border: '2px dashed #fbbf24',
        borderRadius: '8px'
      }}>
        <p style={{ color: '#fbbf24', margin: '0' }}>
          ⚠️ Mode de diagnosis: Component mínim sense providers
        </p>
      </div>
    </div>
  );
}
