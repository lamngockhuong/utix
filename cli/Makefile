VERSION ?= 1.0.0
BINARY = utix-go
LDFLAGS = -ldflags "-s -w -X github.com/lamngockhuong/utix/cli/cmd.Version=$(VERSION)"

.PHONY: build build-all clean test lint lint-fix fmt

# Build for current platform
build:
	go build $(LDFLAGS) -o $(BINARY) .

# Build optimized (smaller binary)
build-optimized:
	go build $(LDFLAGS) -trimpath -o $(BINARY) .

# Build for all platforms
build-all: clean
	mkdir -p dist
	# Linux
	GOOS=linux GOARCH=amd64 go build $(LDFLAGS) -trimpath -o dist/$(BINARY)-linux-amd64 .
	GOOS=linux GOARCH=arm64 go build $(LDFLAGS) -trimpath -o dist/$(BINARY)-linux-arm64 .
	# macOS
	GOOS=darwin GOARCH=amd64 go build $(LDFLAGS) -trimpath -o dist/$(BINARY)-darwin-amd64 .
	GOOS=darwin GOARCH=arm64 go build $(LDFLAGS) -trimpath -o dist/$(BINARY)-darwin-arm64 .
	# Windows
	GOOS=windows GOARCH=amd64 go build $(LDFLAGS) -trimpath -o dist/$(BINARY)-windows-amd64.exe .

# Run tests
test:
	go test -v ./...

# Clean build artifacts
clean:
	rm -f $(BINARY)
	rm -rf dist/

# Install locally
install: build
	cp $(BINARY) /usr/local/bin/utix-go

# Check binary size
size: build-optimized
	@ls -lh $(BINARY)
	@file $(BINARY)

GOLANGCI_LINT_VERSION ?= v2.11.3
GOLANGCI_LINT = $(shell go env GOPATH)/bin/golangci-lint

# Lint code
lint:
	@test -x $(GOLANGCI_LINT) || go install github.com/golangci/golangci-lint/v2/cmd/golangci-lint@$(GOLANGCI_LINT_VERSION)
	$(GOLANGCI_LINT) run

# Lint and fix
lint-fix:
	@test -x $(GOLANGCI_LINT) || go install github.com/golangci/golangci-lint/v2/cmd/golangci-lint@$(GOLANGCI_LINT_VERSION)
	$(GOLANGCI_LINT) run --fix

# Format code
fmt:
	go fmt ./...
	gofmt -s -w .
