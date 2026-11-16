# Contact Ways (ci-eye) — Desktop Edition Build & Export Guide
# מדריך הפקה והתקנה לגרסת מחשב שולחני (Windows / macOS / Linux)

This project includes a **Compose Multiplatform Desktop module (`/desktop`)** alongside the Android app, with a **Bilingual Switchable Interface (`עברית ⇄ English`)** that dynamically switches between RTL (Hebrew) and LTR (English).

---

## 1. Bilingual Language Switching (`עברית ⇄ English`)

You can switch the entire interface between **Hebrew (RTL)** and **English (LTR)** at any time:
- **Top Bar**: Click the **`EN`** / **`עב`** button in the top-right action bar.
- **Desktop Side Navigation Rail**: Click **`EN ⇄ עב`** in the lower rail controls.
- **Opening Weight-Transfer Screen**: Click **`English | עברית`** in the top corner.
- **Desktop Keyboard Shortcut**: Press **`Ctrl + L`** (Windows/Linux) or **`Cmd + L`** (macOS).

---

## 2. Previewing Desktop Mode Right Here in AI Studio

Even before exporting the project to your computer:
1. Click **"🖥️ Open in Desktop Widescreen Mode"** on the intro screen, OR click **"תצוגת מחשב / Desktop View"** in the top-left bar of any screen.
2. The preview automatically rotates to a **16:9 Landscape Widescreen** layout with:
   - Persistent **Side Navigation Rail**
   - **Desktop Viewport Scale (`Zoom 74% / 85% / 100%`)** for desktop monitor proportions
   - **2-Column Split-Screen Views** across Home, 6-Axis New Reflection, Records, Inquiries, Progress, and Profile
   - **Contextual `ⓘ` Info & Guidance Buttons** next to every reflection axis and parameter (in both Hebrew & English)

---

## 3. Running & Packaging as a Native Desktop App (Windows `.exe`/`.msi`, Mac `.dmg`, Linux `.deb`)

### Step 1: Export the Project from AI Studio
1. Click the **Export / Download ZIP** option (or **Push to GitHub**) in the AI Studio menu.
2. Unzip the project folder on your computer.
3. Ensure **JDK 17 or JDK 21** is installed (for example, via Android Studio or Adoptium Temurin).

### Step 2: Run the Desktop App Directly
Open a terminal inside the `/desktop` folder and run:

```bash
cd desktop
gradle run
```
*(Or open the `/desktop` folder in **IntelliJ IDEA / Android Studio** and run `Main.kt`)*

### Step 3: Package a Standalone Installer for Your OS
From the `/desktop` directory, run the matching Gradle task for your operating system:

- **Windows (`.exe` / `.msi` installer)**:
  ```bash
  gradle packageMsi
  # or
  gradle packageExe
  ```
- **macOS (`.dmg` installer)**:
  ```bash
  gradle packageDmg
  ```
- **Linux (`.deb` package)**:
  ```bash
  gradle packageDeb
  ```

The compiled native desktop installer will be created in:
`desktop/build/compose/binaries/main/`

---

## 4. Desktop Keyboard Shortcuts

| Shortcut | Action (English) | פעולה (עברית) |
| :--- | :--- | :--- |
| **`F11`** | Toggle Full-Screen Window | מעבר למסך מלא / חלון רגיל |
| **`Ctrl + L`** / **`Cmd + L`** | Toggle Language (`English ⇄ עברית`) | החלפת שפה וכיוון (`עברית ⇄ English`) |
| **`Ctrl + N`** / **`Cmd + N`** | Open **New 6-Axis Reflection** | פתיחת מסך **רפלקציה חדשה לפי 6 צירים** |
| **`Ctrl + G`** / **`Cmd + G`** | Open **Somatic Info & Guidance** | פתיחת **מדריך והסבר סומטי** |

---

## 5. הוראות בעברית ליצוא והתקנה במחשב האישי

1. **הורדת הפרויקט**: בתפריט העליון של AI Studio בחרו ב-**Download ZIP** (או **Export to GitHub**) וחלצו את התיקייה במחשב.
2. **הרצה מיידית במחשב**: פתחו את תיקיית `desktop` בטרמינל או ב-IntelliJ IDEA / Android Studio והריצו:
   ```bash
   cd desktop
   gradle run
   ```
3. **יצירת קובץ התקנה (`.exe` ל-Windows או `.dmg` ל-Mac)**:
   - במחשב Windows הריצו: `gradle packageExe` או `gradle packageMsi`
   - במחשב Mac הריצו: `gradle packageDmg`
4. **החלפת שפה וכיוון (עברית ⇄ אנגלית)**: ניתן ללחוץ בכל עת על כפתור **`EN / עב`** בסרגל העליון או בסרגל הצד השולחני, או להקיש במקלדת **`Ctrl + L`**.
