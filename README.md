# Eye-on-CI v2.0

**Eye-on-CI** היא מערכת רפלקציה, תיעוד וחקירה סומטית לקונטקט אימפרוביזציה (Contact Improvisation) ולדיאלוג תנועתי.

**Eye-on-CI** is a bilingual (Hebrew / English) somatic reflection, guided practice, and research suite for Contact Improvisation dancers, facilitators, and 1:1 movement clinics.

---

## עיקרי המערכת | Core Architecture (v2.0)

1. **5 צירי-על תלת-קוטביים (`Under ↔ Flow ↔ Over`)**:
   - **מכניקה, פיזיקה ומורפולוגיה** (`mechanics`)
   - **תפיסה, חישה וקשב עורי** (`perception`)
   - **תנועה, ביצוע וזיקות לאבאן — LMA** (`behavior`)
   - **ויסות רגשי ודינמיקה בינאישית** (`emotion`)
   - **אתיקה, הסכמה ומרקם קהילתי** (`ethics`)
   - *ללא ציונים מספריים או אחוזים במפות הנוכחות הרכות — מבוסס על שפה איכותנית ומכילה.*

2. **מטריצת 150 הפרמטרים האבחוניים (30 לכל ציר)**:
   - מיפוי דו-לשוני מלא (עברית ואנגלית) עם מצבי `Under`, `Flow`, `Over`, שאלות שיקוף קטליטיות וקישור ישיר לתרגולים מונחים.
   - חשיפה מדורגת וממוקדת (3 פרמטרים בכל פעם + כפתור `עוד (+3)`) למניעת הצפה קוגניטיבית.

3. **6 סְקוֹרים וטיימרים אינטראקטיביים (`Guided Scores`)**:
   - *הריקוד הקטן (Small Dance)* · *כוונון סנסורי (360° Skin)* · *שני הנהרות (Two Rivers)* · *קילוף התפוז (Keluf — רגע, סליחה, שלום)* · *גמישות מאמץ (LMA Resiliency)* · *מרפאת 1:1 (20 דקות ב־3 פעימות)*.
   - כולל צליל קערה טיבטית עדין מבוסס Web Audio API ומכוון נשימה חזותי.

4. **אחסון היברידי (מקומי + ענן Firebase)**:
   - עבודה מיידית באחסון מקומי בדפדפן (`localStorage`) ללא צורך בהתחברות, או סנכרון מלא לענן באמצעות Google Sign-In ו־Cloud Firestore.

5. **סטודיו מנהלים (`Manager Studio`)**:
   - ניהול כותרות ותוכן האתר, עריכת כרטיסיות תרגול וחקירות, סימון דגשי מטריצה (150), צפייה במשובי משתמשים וייבוא חומרים מ־Google Docs או NotebookLM.

---

## התקנה והרצה מקומית | Local Development Setup

### דרישות קדם | Prerequisites
- **Node.js** `>= 20.x`
- **npm** או **bun**

### 1. שכפול המאגר והתקנת תלויות | Clone & Install
```bash
git clone <YOUR_GITHUB_REPO_URL>
cd contact-ways
npm install
```

### 2. הגדרת משתני סביבה | Environment Variables
שכפל את קובץ הדוגמה `.env.example` לקובץ `.env`:
```bash
cp .env.example .env
```
- `GEMINI_API_KEY`: מפתח API של Google Gemini (אופציונלי — בלעדיו המערכת מפעילה מנגנון מענה סומטי מובנה).
- `VITE_FIREBASE_*`: אופציונלי — במידה ורוצים לחבר פרויקט Firebase אישי במקום הקובץ `firebase-applet-config.json`.

### 3. הפעלת שרת הפיתוח | Run Dev Server
```bash
npm run dev
```
האפליקציה תיפתח בכתובת `http://localhost:3000`.

---

## פקודות שימושיות | Available Scripts

| פקודה / Script | תיאור / Description |
| :--- | :--- |
| `npm run dev` | הפעלת שרת הפיתוח המלא (Express + Vite Middleware) על פורט `3000` |
| `npm run build` | בניית קובצי הפרודקשן של צד הלקוח אל תיקיית `dist/` |
| `npm run start:prod` | הרצת שרת הפרודקשן המגיש את `dist/` ואת נתיבי ה־API |
| `npm run lint` | בדיקת טיפוסים מלאה של TypeScript (`tsc --noEmit`) |
| `npm run lint:rules` | בדיקת תקינות חוקי האבטחה של Firestore (`firestore.rules`) |

---

## פריסת חוקי אבטחה ב־Firebase | Deploying Firestore Security Rules

```bash
npm run lint:rules
firebase deploy --only firestore:rules
```

---

## פיתוח ויצירת קשר | Credits & Contact

- **אדריכלות ופיתוח**: **Zohar R.** (`zoharrb@gmail.com`)
