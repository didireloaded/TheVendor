const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

code = code.replace(/vendorId: q.vendor_id,/g, 'vendorId: q.vendor_id as string,');
code = code.replace(/createdAt: new Date\(q.created_at\).getTime\(\),/g, 'createdAt: new Date(q.created_at || Date.now()).getTime(),');

code = code.replace(/vendorId: c.vendor_id,/g, 'vendorId: c.vendor_id as string,');
code = code.replace(/type: c.type,/g, 'type: (c.type as any) || "general",');
code = code.replace(/unread: c.unread_count,/g, 'unread: c.unread_count || 0,');
code = code.replace(/lastActivity: new Date\(c.last_activity\).getTime\(\),/g, 'lastActivity: new Date(c.last_activity || Date.now()).getTime(),');

code = code.replace(/time: new Date\(m.created_at\).getTime\(\),/g, 'time: new Date(m.created_at || Date.now()).getTime(),');

code = code.replace(/sender: m.sender,/g, 'sender: m.sender_id === user?.id ? "user" : "vendor",');

code = code.replace(/lastActivity: new Date\(cData.last_activity\).getTime\(\),/g, 'lastActivity: new Date(cData.last_activity || Date.now()).getTime(),');

code = code.replace(/sender: sender,/g, 'sender_id: user?.id || "",');

code = code.replace(/await supabase.from\('messages'\).update\(\{ read: true \}\)/g, 'await supabase.from("messages").update({ read: true } as any)');
code = code.replace(/\.eq\('sender', 'vendor'\);/g, ';'); // remove sender eq

code = code.replace(/createdAt: new Date\(qData.created_at\).getTime\(\),/g, 'createdAt: new Date(qData.created_at || Date.now()).getTime(),');

fs.writeFileSync('src/context/AppContext.tsx', code);
