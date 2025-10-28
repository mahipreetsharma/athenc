const e = React.createElement;

function App(){
  const [file, setFile] = React.useState(null);
  const [password, setPassword] = React.useState("");
  const [mode, setMode] = React.useState("encrypt");
  const [busy, setBusy] = React.useState(false);

  async function submit(eve){
    eve.preventDefault();
    if(!file){alert('Choose a file');return}
    if(!password){alert('Enter password');return}
    setBusy(true);
    const form = new FormData();
    form.append('file', file);
    form.append('password', password);
    const endpoint = mode === 'encrypt' ? '/encrypt' : '/decrypt';
    try{
      const resp = await fetch(endpoint, {method: 'POST', body: form});
      if(!resp.ok){
        const j = await resp.json();
        alert('Error: ' + (j.detail || resp.statusText));
        setBusy(false);
        return;
      }
      const blob = await resp.blob();
      const disp = resp.headers.get('content-disposition');
      let fname = 'output';
      if(disp){
        const m = /filename="?([^";]+)"?/.exec(disp);
        if(m) fname = m[1];
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = fname; a.click();
      URL.revokeObjectURL(url);
    }catch(err){
      alert('Upload failed: ' + err.message);
    }
    setBusy(false);
  }

  return e('div', {style:{fontFamily:'Arial,Helvetica,sans-serif',maxWidth:600,margin:'40px auto'}},
    e('h2', null, 'Encrypt / Decrypt'),
    e('form', {onSubmit: submit},
      e('div', null,
        e('label', null, 'Mode: '),
        e('select', {value:mode, onChange: (e)=>setMode(e.target.value)},
          e('option', {value:'encrypt'}, 'Encrypt'),
          e('option', {value:'decrypt'}, 'Decrypt')
        )
      ),
      e('div', {style:{marginTop:10}},
        e('input', {type:'file', onChange: (e)=>setFile(e.target.files[0])})
      ),
      e('div', {style:{marginTop:10}},
        e('input', {type:'password', placeholder:'Password', value:password, onChange:(e)=>setPassword(e.target.value), style:{width:'100%',padding:8}})
      ),
      e('div', {style:{marginTop:10}},
        e('button', {type:'submit', disabled:busy}, busy ? 'Working...' : (mode==='encrypt'?'Encrypt':'Decrypt'))
      )
    ),
    e('p', {style:{marginTop:20,fontSize:12,color:'#666'}}, 'Notes: uses AES-GCM with PBKDF2; encrypted file contains salt+nonce+ciphertext.')
  );
}

const root = document.getElementById('root');
ReactDOM.render(React.createElement(App), root);
