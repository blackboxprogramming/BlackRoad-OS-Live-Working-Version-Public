/*
 * BlackRoad OS Language - Native C Compiler
 * Designed for Raspberry Pi and embedded systems
 * Zero dependencies, pure C99
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <stdbool.h>

// ============================================================================
// TOKEN DEFINITIONS
// ============================================================================

typedef enum {
    // Literals
    TOKEN_INTEGER,
    TOKEN_FLOAT,
    TOKEN_STRING,
    TOKEN_BOOLEAN,
    TOKEN_COLOR,

    // Identifiers
    TOKEN_IDENTIFIER,

    // Keywords - Control Flow
    TOKEN_IF,
    TOKEN_ELIF,
    TOKEN_ELSE,
    TOKEN_MATCH,
    TOKEN_FOR,
    TOKEN_WHILE,
    TOKEN_BREAK,
    TOKEN_CONTINUE,
    TOKEN_RETURN,

    // Keywords - Declarations
    TOKEN_LET,
    TOKEN_VAR,
    TOKEN_CONST,
    TOKEN_FUN,
    TOKEN_ASYNC,
    TOKEN_TYPE,
    TOKEN_MODULE,
    TOKEN_IMPORT,
    TOKEN_FROM,
    TOKEN_EXPORT,

    // Keywords - 3D
    TOKEN_SPACE,
    TOKEN_CUBE,
    TOKEN_SPHERE,
    TOKEN_PLANE,
    TOKEN_LIGHT,
    TOKEN_CAMERA,
    TOKEN_RENDER,

    // Keywords - Concurrency
    TOKEN_SPAWN,
    TOKEN_AWAIT,
    TOKEN_CHAN,

    // Types
    TOKEN_INT_TYPE,
    TOKEN_FLOAT_TYPE,
    TOKEN_STRING_TYPE,
    TOKEN_BOOL_TYPE,
    TOKEN_VEC2,
    TOKEN_VEC3,
    TOKEN_VEC4,

    // Operators
    TOKEN_PLUS,        // +
    TOKEN_MINUS,       // -
    TOKEN_STAR,        // *
    TOKEN_SLASH,       // /
    TOKEN_ASSIGN,      // =
    TOKEN_EQ,          // ==
    TOKEN_NE,          // !=
    TOKEN_LT,          // <
    TOKEN_GT,          // >
    TOKEN_LE,          // <=
    TOKEN_GE,          // >=
    TOKEN_ARROW,       // ->
    TOKEN_DOUBLE_DOT,  // ..

    // Delimiters
    TOKEN_LPAREN,      // (
    TOKEN_RPAREN,      // )
    TOKEN_LBRACKET,    // [
    TOKEN_RBRACKET,    // ]
    TOKEN_LBRACE,      // {
    TOKEN_RBRACE,      // }
    TOKEN_COLON,       // :
    TOKEN_COMMA,       // ,
    TOKEN_DOT,         // .

    // Special
    TOKEN_NEWLINE,
    TOKEN_INDENT,
    TOKEN_DEDENT,
    TOKEN_EOF,
    TOKEN_ERROR
} TokenType;

typedef struct {
    TokenType type;
    char* start;
    int length;
    int line;
    int column;
} Token;

// ============================================================================
// LEXER
// ============================================================================

typedef struct {
    const char* start;
    const char* current;
    int line;
    int column;
    int indent_stack[256];
    int indent_top;
} Lexer;

void lexer_init(Lexer* lexer, const char* source) {
    lexer->start = source;
    lexer->current = source;
    lexer->line = 1;
    lexer->column = 1;
    lexer->indent_stack[0] = 0;
    lexer->indent_top = 0;
}

bool is_at_end(Lexer* lexer) {
    return *lexer->current == '\0';
}

char advance(Lexer* lexer) {
    if (*lexer->current == '\n') {
        lexer->line++;
        lexer->column = 1;
    } else {
        lexer->column++;
    }
    lexer->current++;
    return lexer->current[-1];
}

char peek(Lexer* lexer) {
    return *lexer->current;
}

char peek_next(Lexer* lexer) {
    if (is_at_end(lexer)) return '\0';
    return lexer->current[1];
}

bool match(Lexer* lexer, char expected) {
    if (is_at_end(lexer)) return false;
    if (*lexer->current != expected) return false;
    lexer->current++;
    lexer->column++;
    return true;
}

void skip_whitespace(Lexer* lexer) {
    while (true) {
        char c = peek(lexer);
        if (c == ' ' || c == '\t' || c == '\r') {
            advance(lexer);
        } else if (c == '#') {
            // Comment - skip to end of line
            while (peek(lexer) != '\n' && !is_at_end(lexer)) {
                advance(lexer);
            }
        } else {
            return;
        }
    }
}

Token make_token(Lexer* lexer, TokenType type) {
    Token token;
    token.type = type;
    token.start = lexer->start;
    token.length = (int)(lexer->current - lexer->start);
    token.line = lexer->line;
    token.column = lexer->column;
    return token;
}

Token error_token(Lexer* lexer, const char* message) {
    Token token;
    token.type = TOKEN_ERROR;
    token.start = message;
    token.length = (int)strlen(message);
    token.line = lexer->line;
    token.column = lexer->column;
    return token;
}

Token number(Lexer* lexer) {
    while (isdigit(peek(lexer))) {
        advance(lexer);
    }

    // Check for float
    if (peek(lexer) == '.' && isdigit(peek_next(lexer))) {
        advance(lexer); // .
        while (isdigit(peek(lexer))) {
            advance(lexer);
        }
        return make_token(lexer, TOKEN_FLOAT);
    }

    return make_token(lexer, TOKEN_INTEGER);
}

Token string(Lexer* lexer, char quote) {
    while (peek(lexer) != quote && !is_at_end(lexer)) {
        if (peek(lexer) == '\n') lexer->line++;
        advance(lexer);
    }

    if (is_at_end(lexer)) {
        return error_token(lexer, "Unterminated string");
    }

    advance(lexer); // Closing quote
    return make_token(lexer, TOKEN_STRING);
}

TokenType check_keyword(Lexer* lexer, int start, int length, const char* rest, TokenType type) {
    if (lexer->current - lexer->start == start + length &&
        memcmp(lexer->start + start, rest, length) == 0) {
        return type;
    }
    return TOKEN_IDENTIFIER;
}

TokenType identifier_type(Lexer* lexer) {
    switch (lexer->start[0]) {
        case 'a':
            if (lexer->current - lexer->start > 1) {
                switch (lexer->start[1]) {
                    case 's': return check_keyword(lexer, 2, 3, "ync", TOKEN_ASYNC);
                    case 'w': return check_keyword(lexer, 2, 3, "ait", TOKEN_AWAIT);
                }
            }
            break;
        case 'b':
            if (lexer->current - lexer->start > 1) {
                switch (lexer->start[1]) {
                    case 'o': return check_keyword(lexer, 2, 2, "ol", TOKEN_BOOL_TYPE);
                    case 'r': return check_keyword(lexer, 2, 3, "eak", TOKEN_BREAK);
                }
            }
            break;
        case 'c':
            if (lexer->current - lexer->start > 1) {
                switch (lexer->start[1]) {
                    case 'a': return check_keyword(lexer, 2, 4, "mera", TOKEN_CAMERA);
                    case 'h': return check_keyword(lexer, 2, 2, "an", TOKEN_CHAN);
                    case 'o':
                        if (lexer->current - lexer->start > 2) {
                            switch (lexer->start[2]) {
                                case 'n':
                                    if (lexer->current - lexer->start == 5) return TOKEN_CONST;
                                    return check_keyword(lexer, 3, 5, "tinue", TOKEN_CONTINUE);
                            }
                        }
                        break;
                    case 'u': return check_keyword(lexer, 2, 2, "be", TOKEN_CUBE);
                }
            }
            break;
        case 'e':
            if (lexer->current - lexer->start > 1) {
                switch (lexer->start[1]) {
                    case 'l':
                        if (lexer->current - lexer->start == 4) return TOKEN_ELIF;
                        return check_keyword(lexer, 2, 2, "se", TOKEN_ELSE);
                    case 'x': return check_keyword(lexer, 2, 4, "port", TOKEN_EXPORT);
                }
            }
            break;
        case 'f':
            if (lexer->current - lexer->start > 1) {
                switch (lexer->start[1]) {
                    case 'a': return check_keyword(lexer, 2, 3, "lse", TOKEN_BOOLEAN);
                    case 'l': return check_keyword(lexer, 2, 3, "oat", TOKEN_FLOAT_TYPE);
                    case 'o': return check_keyword(lexer, 2, 1, "r", TOKEN_FOR);
                    case 'r': return check_keyword(lexer, 2, 2, "om", TOKEN_FROM);
                    case 'u': return check_keyword(lexer, 2, 1, "n", TOKEN_FUN);
                }
            }
            break;
        case 'i':
            if (lexer->current - lexer->start > 1) {
                switch (lexer->start[1]) {
                    case 'f': return check_keyword(lexer, 2, 0, "", TOKEN_IF);
                    case 'm': return check_keyword(lexer, 2, 4, "port", TOKEN_IMPORT);
                    case 'n': return check_keyword(lexer, 2, 1, "t", TOKEN_INT_TYPE);
                }
            }
            break;
        case 'l':
            if (lexer->current - lexer->start > 1) {
                switch (lexer->start[1]) {
                    case 'e': return check_keyword(lexer, 2, 1, "t", TOKEN_LET);
                    case 'i': return check_keyword(lexer, 2, 3, "ght", TOKEN_LIGHT);
                }
            }
            break;
        case 'm':
            if (lexer->current - lexer->start > 1) {
                switch (lexer->start[1]) {
                    case 'a': return check_keyword(lexer, 2, 3, "tch", TOKEN_MATCH);
                    case 'o': return check_keyword(lexer, 2, 4, "dule", TOKEN_MODULE);
                }
            }
            break;
        case 'p': return check_keyword(lexer, 1, 4, "lane", TOKEN_PLANE);
        case 'r':
            if (lexer->current - lexer->start > 1) {
                switch (lexer->start[1]) {
                    case 'e':
                        if (lexer->current - lexer->start > 2) {
                            switch (lexer->start[2]) {
                                case 'n': return check_keyword(lexer, 3, 3, "der", TOKEN_RENDER);
                                case 't': return check_keyword(lexer, 3, 3, "urn", TOKEN_RETURN);
                            }
                        }
                        break;
                }
            }
            break;
        case 's':
            if (lexer->current - lexer->start > 1) {
                switch (lexer->start[1]) {
                    case 'p':
                        if (lexer->current - lexer->start > 2) {
                            switch (lexer->start[2]) {
                                case 'a':
                                    if (lexer->current - lexer->start == 5) return TOKEN_SPACE;
                                    return check_keyword(lexer, 3, 2, "wn", TOKEN_SPAWN);
                                case 'h': return check_keyword(lexer, 3, 3, "ere", TOKEN_SPHERE);
                            }
                        }
                        break;
                    case 't': return check_keyword(lexer, 2, 4, "ring", TOKEN_STRING_TYPE);
                }
            }
            break;
        case 't':
            if (lexer->current - lexer->start > 1) {
                switch (lexer->start[1]) {
                    case 'r': return check_keyword(lexer, 2, 2, "ue", TOKEN_BOOLEAN);
                    case 'y': return check_keyword(lexer, 2, 2, "pe", TOKEN_TYPE);
                }
            }
            break;
        case 'v':
            if (lexer->current - lexer->start > 1) {
                switch (lexer->start[1]) {
                    case 'a': return check_keyword(lexer, 2, 1, "r", TOKEN_VAR);
                    case 'e':
                        if (lexer->current - lexer->start == 4) {
                            switch (lexer->start[3]) {
                                case '2': return TOKEN_VEC2;
                                case '3': return TOKEN_VEC3;
                                case '4': return TOKEN_VEC4;
                            }
                        }
                        break;
                }
            }
            break;
        case 'w': return check_keyword(lexer, 1, 4, "hile", TOKEN_WHILE);
    }

    return TOKEN_IDENTIFIER;
}

Token identifier(Lexer* lexer) {
    while (isalnum(peek(lexer)) || peek(lexer) == '_') {
        advance(lexer);
    }
    return make_token(lexer, identifier_type(lexer));
}

Token scan_token(Lexer* lexer) {
    skip_whitespace(lexer);

    lexer->start = lexer->current;

    if (is_at_end(lexer)) return make_token(lexer, TOKEN_EOF);

    char c = advance(lexer);

    // Numbers
    if (isdigit(c)) return number(lexer);

    // Identifiers and keywords
    if (isalpha(c) || c == '_') return identifier(lexer);

    switch (c) {
        // Strings
        case '"':
        case '\'':
            return string(lexer, c);

        // Single-character tokens
        case '(': return make_token(lexer, TOKEN_LPAREN);
        case ')': return make_token(lexer, TOKEN_RPAREN);
        case '[': return make_token(lexer, TOKEN_LBRACKET);
        case ']': return make_token(lexer, TOKEN_RBRACKET);
        case '{': return make_token(lexer, TOKEN_LBRACE);
        case '}': return make_token(lexer, TOKEN_RBRACE);
        case ':': return make_token(lexer, TOKEN_COLON);
        case ',': return make_token(lexer, TOKEN_COMMA);
        case '+': return make_token(lexer, TOKEN_PLUS);
        case '*': return make_token(lexer, TOKEN_STAR);
        case '/': return make_token(lexer, TOKEN_SLASH);
        case '\n': return make_token(lexer, TOKEN_NEWLINE);

        // Two-character tokens
        case '-':
            return make_token(lexer, match(lexer, '>') ? TOKEN_ARROW : TOKEN_MINUS);
        case '=':
            return make_token(lexer, match(lexer, '=') ? TOKEN_EQ : TOKEN_ASSIGN);
        case '!':
            if (match(lexer, '=')) return make_token(lexer, TOKEN_NE);
            break;
        case '<':
            return make_token(lexer, match(lexer, '=') ? TOKEN_LE : TOKEN_LT);
        case '>':
            return make_token(lexer, match(lexer, '=') ? TOKEN_GE : TOKEN_GT);
        case '.':
            if (match(lexer, '.')) return make_token(lexer, TOKEN_DOUBLE_DOT);
            return make_token(lexer, TOKEN_DOT);

        // Color code #FF1D6C
        case '#':
            while (isxdigit(peek(lexer))) {
                advance(lexer);
            }
            return make_token(lexer, TOKEN_COLOR);
    }

    return error_token(lexer, "Unexpected character");
}

// ============================================================================
// BYTECODE VM
// ============================================================================

typedef enum {
    OP_CONSTANT,
    OP_ADD,
    OP_SUBTRACT,
    OP_MULTIPLY,
    OP_DIVIDE,
    OP_NEGATE,
    OP_RETURN,
    OP_PRINT,
} OpCode;

typedef struct {
    uint8_t* code;
    int count;
    int capacity;
} Chunk;

void init_chunk(Chunk* chunk) {
    chunk->code = NULL;
    chunk->count = 0;
    chunk->capacity = 0;
}

void write_chunk(Chunk* chunk, uint8_t byte) {
    if (chunk->capacity < chunk->count + 1) {
        int old_capacity = chunk->capacity;
        chunk->capacity = old_capacity < 8 ? 8 : old_capacity * 2;
        chunk->code = realloc(chunk->code, chunk->capacity);
    }
    chunk->code[chunk->count] = byte;
    chunk->count++;
}

void free_chunk(Chunk* chunk) {
    free(chunk->code);
    init_chunk(chunk);
}

// ============================================================================
// MAIN
// ============================================================================

char* read_file(const char* path) {
    FILE* file = fopen(path, "rb");
    if (file == NULL) {
        fprintf(stderr, "Could not open file \"%s\".\n", path);
        exit(74);
    }

    fseek(file, 0L, SEEK_END);
    size_t file_size = ftell(file);
    rewind(file);

    char* buffer = (char*)malloc(file_size + 1);
    if (buffer == NULL) {
        fprintf(stderr, "Not enough memory to read \"%s\".\n", path);
        exit(74);
    }

    size_t bytes_read = fread(buffer, sizeof(char), file_size, file);
    if (bytes_read < file_size) {
        fprintf(stderr, "Could not read file \"%s\".\n", path);
        exit(74);
    }

    buffer[bytes_read] = '\0';
    fclose(file);
    return buffer;
}

void run_file(const char* path) {
    char* source = read_file(path);

    Lexer lexer;
    lexer_init(&lexer, source);

    printf("=== BlackRoad OS Language Compiler ===\n");
    printf("Tokenizing %s...\n\n", path);

    int line = -1;
    while (true) {
        Token token = scan_token(&lexer);

        if (token.line != line) {
            printf("%4d ", token.line);
            line = token.line;
        } else {
            printf("   | ");
        }

        printf("%-20s '", token.type == TOKEN_IDENTIFIER ? "IDENTIFIER" :
                            token.type == TOKEN_INTEGER ? "INTEGER" :
                            token.type == TOKEN_FLOAT ? "FLOAT" :
                            token.type == TOKEN_STRING ? "STRING" :
                            token.type == TOKEN_LET ? "LET" :
                            token.type == TOKEN_FUN ? "FUN" :
                            token.type == TOKEN_SPACE ? "SPACE" :
                            token.type == TOKEN_CUBE ? "CUBE" :
                            token.type == TOKEN_VEC3 ? "VEC3" :
                            token.type == TOKEN_COLOR ? "COLOR" :
                            token.type == TOKEN_COLON ? "COLON" :
                            token.type == TOKEN_ASSIGN ? "ASSIGN" :
                            token.type == TOKEN_ARROW ? "ARROW" :
                            token.type == TOKEN_LPAREN ? "LPAREN" :
                            token.type == TOKEN_RPAREN ? "RPAREN" :
                            token.type == TOKEN_NEWLINE ? "NEWLINE" :
                            token.type == TOKEN_EOF ? "EOF" :
                            "UNKNOWN");

        printf("%.*s'\n", token.length, token.start);

        if (token.type == TOKEN_EOF) break;
    }

    free(source);
}

void repl() {
    char line[1024];
    printf("BlackRoad OS Language REPL\n");
    printf("Type 'exit' to quit\n\n");

    while (true) {
        printf("> ");

        if (!fgets(line, sizeof(line), stdin)) {
            printf("\n");
            break;
        }

        if (strcmp(line, "exit\n") == 0) break;

        Lexer lexer;
        lexer_init(&lexer, line);

        Token token;
        do {
            token = scan_token(&lexer);
            printf("%.*s ", token.length, token.start);
        } while (token.type != TOKEN_EOF && token.type != TOKEN_NEWLINE);

        printf("\n");
    }
}

int main(int argc, char* argv[]) {
    if (argc == 1) {
        repl();
    } else if (argc == 2) {
        run_file(argv[1]);
    } else {
        fprintf(stderr, "Usage: roadc [path]\n");
        exit(64);
    }

    return 0;
}
