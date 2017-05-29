MUMPSTEST

; Wrappers for select Lexicon Utility routines

LOOKUP(X,LEN,SRC,SUB,DATE)
 W "BUILDLOOKUPALLJSON^ZVDPLEX: "_CNT,!
 N RES,VAR
 S VAR=1024.23
 S SRC=$G(SRC,""),SUB=$G(SUB,""),RES=";"
 D FOO^BAR ; This is a test should register as a comment
 I SOMETHING'="" D
 . D FOO^BAR
 . S VAR=$$UPPER^XSTR
 Q