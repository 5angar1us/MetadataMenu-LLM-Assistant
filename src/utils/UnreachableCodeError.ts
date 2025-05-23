class UnreachableCodeError extends Error {
  constructor(message = "This code should be unreachable.") {
    super(message);
    this.name = "UnreachableCodeError";
  }
}

