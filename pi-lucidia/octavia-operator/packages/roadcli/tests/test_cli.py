"""Tests for the RoadCLI framework — parser, commands, context, hooks."""

import sys
import os
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from roadcli.cli import CLI, Command, Context, Parser, Option, Argument, Group


class TestContext:
    def test_empty_context(self):
        ctx = Context()
        assert ctx.get("missing") is None
        assert ctx.get("missing", "default") == "default"

    def test_options_priority(self):
        ctx = Context()
        ctx.options["key"] = "from_opt"
        ctx.arguments["key"] = "from_arg"
        assert ctx.get("key") == "from_opt"

    def test_arguments_fallback(self):
        ctx = Context()
        ctx.arguments["name"] = "alice"
        assert ctx.get("name") == "alice"


class TestParser:
    def test_parse_long_option(self):
        cmd = Command(
            name="test", handler=lambda c: 0,
            options=[Option(name="verbose", type=str, default="false")]
        )
        ctx = Parser(cmd).parse(["--verbose", "true"])
        assert ctx.options["verbose"] == "true"

    def test_parse_long_option_equals(self):
        cmd = Command(
            name="test", handler=lambda c: 0,
            options=[Option(name="output", type=str)]
        )
        ctx = Parser(cmd).parse(["--output=file.txt"])
        assert ctx.options["output"] == "file.txt"

    def test_parse_short_option(self):
        cmd = Command(
            name="test", handler=lambda c: 0,
            options=[Option(name="verbose", short="v", type=str)]
        )
        ctx = Parser(cmd).parse(["-v", "true"])
        assert ctx.options["verbose"] == "true"

    def test_parse_int_option(self):
        cmd = Command(
            name="test", handler=lambda c: 0,
            options=[Option(name="count", type=int, default=1)]
        )
        ctx = Parser(cmd).parse(["--count", "5"])
        assert ctx.options["count"] == 5

    def test_parse_bool_option(self):
        cmd = Command(
            name="test", handler=lambda c: 0,
            options=[Option(name="flag", type=bool)]
        )
        ctx = Parser(cmd).parse(["--flag", "yes"])
        assert ctx.options["flag"] is True

    def test_parse_bool_option_false(self):
        cmd = Command(
            name="test", handler=lambda c: 0,
            options=[Option(name="flag", type=bool)]
        )
        ctx = Parser(cmd).parse(["--flag", "no"])
        assert ctx.options["flag"] is False

    def test_parse_positional_argument(self):
        cmd = Command(
            name="test", handler=lambda c: 0,
            arguments=[Argument(name="filename", type=str)]
        )
        ctx = Parser(cmd).parse(["hello.txt"])
        assert ctx.arguments["filename"] == "hello.txt"

    def test_parse_multiple_arguments(self):
        cmd = Command(
            name="test", handler=lambda c: 0,
            arguments=[
                Argument(name="src", type=str),
                Argument(name="dst", type=str),
            ]
        )
        ctx = Parser(cmd).parse(["a.txt", "b.txt"])
        assert ctx.arguments["src"] == "a.txt"
        assert ctx.arguments["dst"] == "b.txt"

    def test_parse_nargs_star(self):
        cmd = Command(
            name="test", handler=lambda c: 0,
            arguments=[Argument(name="files", type=str, nargs="*")]
        )
        ctx = Parser(cmd).parse(["a.txt", "b.txt", "c.txt"])
        assert ctx.arguments["files"] == ["a.txt", "b.txt", "c.txt"]

    def test_defaults_applied(self):
        cmd = Command(
            name="test", handler=lambda c: 0,
            options=[Option(name="level", type=int, default=3)],
            arguments=[Argument(name="file", required=False, default="stdin")]
        )
        ctx = Parser(cmd).parse([])
        assert ctx.options["level"] == 3
        assert ctx.arguments["file"] == "stdin"

    def test_subcommand_routing(self):
        called = []
        sub = Command(name="sub", handler=lambda c: called.append("sub"))
        root = Command(name="root", handler=lambda c: 0, subcommands={"sub": sub})
        ctx = Parser(root).parse(["sub"])
        assert ctx.command.name == "sub"
        assert ctx.parent is not None

    def test_subcommand_with_args(self):
        sub = Command(
            name="deploy", handler=lambda c: 0,
            options=[Option(name="env", type=str, default="dev")]
        )
        root = Command(name="app", handler=lambda c: 0, subcommands={"deploy": sub})
        ctx = Parser(root).parse(["deploy", "--env", "prod"])
        assert ctx.options["env"] == "prod"


class TestCLI:
    def test_create_cli(self):
        app = CLI("testapp", version="2.0.0", help="A test app")
        assert app.name == "testapp"
        assert app.version == "2.0.0"

    def test_register_command(self):
        app = CLI("test")

        @app.command("greet", help="Say hello")
        def greet(ctx):
            return 0

        assert "greet" in app.root.subcommands
        assert app.root.subcommands["greet"].help == "Say hello"

    def test_run_command(self):
        app = CLI("test")
        results = []

        @app.command("ping", help="Ping")
        def ping(ctx):
            results.append("pong")
            return 0

        code = app.run(["ping"])
        assert code == 0
        assert results == ["pong"]

    def test_run_version(self, capsys):
        app = CLI("myapp", version="3.1.4")
        code = app.run(["--version"])
        assert code == 0
        captured = capsys.readouterr()
        assert "3.1.4" in captured.out

    def test_run_help(self, capsys):
        app = CLI("myapp", version="1.0", help="My app")
        code = app.run(["--help"])
        assert code == 0
        captured = capsys.readouterr()
        assert "myapp" in captured.out

    def test_error_handling(self):
        app = CLI("test")
        errors = []

        @app.command("fail", help="Fail")
        def fail(ctx):
            raise ValueError("boom")

        app.add_hook("error", lambda e: errors.append(str(e)))
        code = app.run(["fail"])
        assert code == 1
        assert "boom" in errors[0]

    def test_before_hook(self):
        app = CLI("test")
        hooks = []

        @app.command("cmd", help="")
        def cmd(ctx):
            return 0

        app.add_hook("before", lambda args: hooks.append(args))
        app.run(["cmd"])
        assert hooks == [["cmd"]]

    def test_after_hook(self):
        app = CLI("test")
        hooks = []

        @app.command("cmd", help="")
        def cmd(ctx):
            return 42

        app.add_hook("after", lambda ctx, result: hooks.append(result))
        app.run(["cmd"])
        assert hooks == [42]


class TestGroup:
    def test_group_commands(self):
        app = CLI("test")
        db = Group(app, "db", help="Database")
        results = []

        @db.command("migrate", help="Run migrations")
        def migrate(ctx):
            results.append("migrated")
            return 0

        code = app.run(["db", "migrate"])
        assert code == 0
        assert results == ["migrated"]

    def test_group_registered(self):
        app = CLI("test")
        Group(app, "config", help="Config commands")
        assert "config" in app.root.subcommands
