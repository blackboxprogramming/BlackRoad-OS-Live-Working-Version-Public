# 🚀 BlackRoad Language - Quick Start Guide

## 5-Minute Setup

### Step 1: Build the Compiler
```bash
cd ~/roadc
gcc -std=c99 -O2 -o roadc roadc.c
```

### Step 2: Write Your First Program
```bash
cat > hello.road << 'EOF'
# My First BlackRoad Program
fun main():
    print("Hello, BlackRoad! 🖤🛣️")
EOF
```

### Step 3: Run It!
```bash
./roadc hello.road
```

## What's Next?

### Try the Examples
```bash
# Simple 3D rotating cube
./roadc examples/hello_3d.road

# Full 3D space shooter game
./roadc examples/space_shooter.road
```

### Start the REPL
```bash
./roadc
> let x = 42
> print(x)
```

### Read the Docs
- [Full Specification](../BLACKROAD_LANGUAGE_SPECIFICATION.md)
- [README](README.md)
- [Complete Guide](../BLACKROAD_LANGUAGE_COMPLETE.md)

## Syntax Cheat Sheet

### Variables
```road
let x: int = 42           # Immutable
var y = 3.14              # Mutable (type inferred)
const PI = 3.14159        # Constant
```

### Functions
```road
fun add(a: int, b: int) -> int:
    return a + b

fun greet(name: string):
    print("Hello, {name}!")
```

### Control Flow
```road
if x > 10:
    print("Large")
elif x > 5:
    print("Medium")
else:
    print("Small")

for i in 0..10:
    print(i)

while condition:
    process()
```

### 3D Objects
```road
space MyScene:
    cube Box:
        position: vec3(0, 0, 0)
        color: #FF1D6C

    light Sun:
        type: point
        intensity: 1.0

    camera Cam:
        position: vec3(0, 0, 5)
        fov: 75
```

### Types
```road
type User:
    name: string
    age: int
    email: string

let user = User{
    name: "Alexa",
    age: 25,
    email: "alexa@blackroad.io"
}
```

## Common Tasks

### Create a 3D Scene
```road
space Game:
    cube Player:
        position: vec3(0, 0, 0)
        color: #FF1D6C

fun main():
    render(Game)
```

### Async/Await
```road
async fun fetchData(url: string) -> string:
    let response = await http.get(url)
    return response.text()

fun main():
    let data = await fetchData("https://api.example.com")
    print(data)
```

### Lists & Loops
```road
let numbers = [1, 2, 3, 4, 5]

for num in numbers:
    print(num * 2)
```

### Pattern Matching
```road
match status:
    200 -> print("OK")
    404 -> print("Not Found")
    500..599 -> print("Server Error")
    _ -> print("Unknown")
```

## Testing Your Code

### Python Parser (for validation)
```bash
python3 parser.py
```

### C Compiler (native)
```bash
./roadc your_file.road
```

## Deploy to Raspberry Pi

```bash
# On your Mac
scp roadc.c pi@192.168.4.38:~

# On the Pi
ssh pi@192.168.4.38
gcc -std=c99 -O2 -o roadc roadc.c
./roadc
```

## Troubleshooting

### "Command not found: roadc"
```bash
# Make sure you compiled it
gcc -std=c99 -O2 -o roadc roadc.c

# Or use full path
./roadc test.road
```

### "Syntax Error"
Check the syntax matches the specification:
```road
# Correct
let x: int = 42

# Wrong
int x = 42  # This is C, not BlackRoad!
```

### "Unexpected token"
Make sure indentation is consistent (spaces or tabs, not mixed).

## Learning Resources

1. **Read the Spec** - `~/BLACKROAD_LANGUAGE_SPECIFICATION.md`
2. **Study Examples** - `~/roadc/examples/*.road`
3. **Experiment in REPL** - `./roadc` (no arguments)
4. **Check the Source** - Lexer and parser are well-documented

## Community

- **Issues**: blackroad.systems@gmail.com
- **Ideas**: amundsonalexa@gmail.com
- **GitHub**: Coming soon!

---

**Happy coding in BlackRoad!** 🖤🛣️
