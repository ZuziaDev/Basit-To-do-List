const express = require('express');
const bodyParser = require('body-parser');
const { Firebase, autoUpdate } = require('zuzia.base');
const serviceAccount = require("./serviceAccountKey.json")
const db = new Firebase({ serviceAccount, databaseURL:"https://nova-community.firebaseio.com" });
autoUpdate();

const app = express();
const PORT = 8080;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.set('views', './views');
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

app.get('/', async (req, res) => {
    try {
        let todos = await db.get('todos');
        let tema = await db.get('tema');
        res.render('index', { todos: todos || [], tema: tema });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/add', async (req, res) => {
    try {
        const task = req.body.add;
        await db.push('todos', task);
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/remove/:index', async (req, res) => {
    try {
        const index = req.params.index;
        let todos = await db.get('todos');
        if (todos && todos.length > index) {
            todos.splice(index, 1);
            await db.set('todos', todos);
        }
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/save-theme', async (req, res) => {
    try {
        const tema = req.body.selectedTheme;
        await setTheme(tema);
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

async function setTheme(tema) {
    const themes = {
        "default": { arkaplan: "#E0E0E0", color: "#000000", inpuback: "#BDBDBD", btn: "#2962FF", btnhvr: "#1744B3", renk: tema },
        "dark": { arkaplan: "#1A1A1A", color: "#FFFFFF", inpuback: "#1E1E1E", btn: "#6200EA", btnhvr: "#3700B3", renk: tema },
        "blue": { arkaplan: "#BBDEFB", color: "#000000", inpuback: "#90CAF9", btn: "#1565C0", btnhvr: "#0D47A1", renk: tema },
        "green": { arkaplan: "#81C784", color: "#000000", inpuback: "#66BB6A", btn: "#2E7D32", btnhvr: "#1B5E20", renk: tema },
        "white": { arkaplan: "#FFFFFF", color: "#000000", inpuback: "#F5F5F5", btn: "#FFAB00", btnhvr: "#FF6F00", renk: tema },
        "red": { arkaplan: "#FFCDD2", color: "#000000", inpuback: "#EF9A9A", btn: "#D32F2F", btnhvr: "#B71C1C", renk: tema },
        "yellow": { arkaplan: "#FFECB3", color: "#000000", inpuback: "#FFD54F", btn: "#FFA000", btnhvr: "#FF6F00", renk: tema },
        "orange": { arkaplan: "#FFCC80", color: "#000000", inpuback: "#FFB74D", btn: "#FF5722", btnhvr: "#E64A19", renk: tema },
        "purple": { arkaplan: "#E1BEE7", color: "#000000", inpuback: "#CE93D8", btn: "#9C27B0", btnhvr: "#7B1FA2", renk: tema },
        "blurple": { arkaplan: "#7289DA", color: "#FFFFFF", inpuback: "#5865F2", btn: "#7289DA", btnhvr: "#5E6BDB", renk: tema }
    };

    const themeValues = themes[tema] || themes["default"];
    return await db.set("tema", themeValues);
}

app.listen(PORT, async () => {
    console.log(`Site http://localhost:${PORT} olarak aktif`);
});
