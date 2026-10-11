const admin = require('firebase-admin');

const DATABASE_URL = 'https://math-practice-class-default-rtdb.europe-west1.firebasedatabase.app';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
    }),
    databaseURL: DATABASE_URL
  });
}

const db = admin.database();
const auth = admin.auth();

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const authHeader = req.headers.authorization || '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) {
    res.status(401).json({ error: 'חסר אימות.' });
    return;
  }

  let callerUid;
  try {
    callerUid = (await auth.verifyIdToken(idToken)).uid;
  } catch (e) {
    res.status(401).json({ error: 'אימות לא תקין.' });
    return;
  }

  let callerRole;
  try {
    callerRole = (await db.ref('users/' + callerUid + '/role').once('value')).val();
  } catch (e) {
    res.status(500).json({ error: 'שגיאה באימות הרשאה.' });
    return;
  }
  if (callerRole !== 'admin' && callerRole !== 'parent') {
    res.status(403).json({ error: 'אין לך הרשאה לבצע פעולה זו.' });
    return;
  }

  const { action, targetUid } = req.body || {};
  if (!action || !targetUid) {
    res.status(400).json({ error: 'בקשה לא תקינה.' });
    return;
  }

  let targetProfile;
  try {
    targetProfile = (await db.ref('users/' + targetUid).once('value')).val();
  } catch (e) {
    res.status(500).json({ error: 'שגיאה בטעינת המשתמש.' });
    return;
  }

  // מנהל יכול לפעול על הורה; הורה יכול לפעול רק על תלמיד משויך אליו
  const callerIsAdminOverParent = callerRole === 'admin' && targetProfile && targetProfile.role === 'parent';
  const callerIsParentOverOwnStudent = callerRole === 'parent' && targetProfile && targetProfile.role === 'student' && targetProfile.parentUid === callerUid;
  if (!targetProfile || (!callerIsAdminOverParent && !callerIsParentOverOwnStudent)) {
    res.status(404).json({ error: 'משתמש לא נמצא או שאין לך הרשאה אליו.' });
    return;
  }

  try {
    if (action === 'resetPassword') {
      const { newPassword } = req.body;
      if (!newPassword || String(newPassword).length < 6) {
        res.status(400).json({ error: 'הסיסמה חייבת להכיל לפחות 6 תווים.' });
        return;
      }
      await auth.updateUser(targetUid, { password: newPassword });
      await db.ref('users/' + targetUid + '/mustChangePassword').set(true);
      res.status(200).json({ ok: true });
      return;
    }

    // עריכת פרטים ומחיקה - רק מנהל, ורק על הורה (לא נחשפות להורה על תלמיד)
    if (!callerIsAdminOverParent) {
      res.status(403).json({ error: 'אין לך הרשאה לבצע פעולה זו.' });
      return;
    }

    if (action === 'updateProfile') {
      const { displayName, username } = req.body;
      const updates = {};
      if (displayName && displayName.trim()) updates.displayName = displayName.trim();
      if (username && username.trim() && username.trim() !== targetProfile.username) {
        const newUsername = username.trim();
        const newEmail = newUsername.toLowerCase() + '@math-practice.local';
        await auth.updateUser(targetUid, { email: newEmail });
        updates.username = newUsername;
      }
      if (Object.keys(updates).length) {
        await db.ref('users/' + targetUid).update(updates);
      }
      res.status(200).json({ ok: true });
      return;
    }

    if (action === 'deleteParent') {
      const linkedSnap = await db.ref('users').orderByChild('parentUid').equalTo(targetUid).once('value');
      if (linkedSnap.exists()) {
        const count = Object.keys(linkedSnap.val()).length;
        res.status(400).json({ error: `להורה הזה יש ${count} תלמיד/ים משויכים. יש להעביר או למחוק אותם קודם.` });
        return;
      }
      await auth.deleteUser(targetUid);
      await db.ref('users/' + targetUid).remove();
      res.status(200).json({ ok: true });
      return;
    }

    res.status(400).json({ error: 'פעולה לא מוכרת.' });
  } catch (e) {
    const msg = e.code === 'auth/email-already-exists' ? 'שם המשתמש הזה כבר תפוס.' : (e.message || String(e));
    res.status(500).json({ error: msg });
  }
};
