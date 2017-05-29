MUMPSTEST

; Wrappers for select Lexicon Utility routines

LOOKUP(X,LEN,SRC,SUB,DATE)
 K  S VAR=100
 W "BUILDLOOKUPALLJSON^ZVDPLEX: "_CNT,!
 N RES,VAR
 S VAR=1024.23
 S SRC=$G(SRC,""),SUB=$G(SUB,""),RES=";"
 D FOO^BAR ; This is a test should register as a comment
 I SOMETHING'="" D
 . D FOO^BAR
 . S VAR=$$UPPER^XSTR
 S X="" F  S X=$O(AR(X)) Q:X=""  W !,X
 Q

PAT I $G(IBQUIT) G END
 D END
 S (IBPAG,IBQUIT)=0 D NOW^%DTC S Y=% D D^DIQ S IBPDAT=Y
 ;
 S DIC("W")="N IBX S IBX=$G(^IBA(354,+Y,0)) W ?32,"" "",$P($G(^DPT(+IBX,0)),U,9),?46,"" "",$$TEXT^IBARXEU0($P(IBX,U,4)),?59,"" "",$P($G(^IBE(354.2,+$P(IBX,U,5),0)),U)"
 N DPTNOFZY S DPTNOFZY=1  ;Suppress PATIENT file fuzzy lookups
 W ! S DIC="^DPT(",DIC("S")="I $D(^IBA(354,+Y,0))",DIC(0)="AEQM",DIC("A")="Select BILLING PATIENT: " D ^DIC K DIC
 G:Y<1 END
 S DFN=+Y,IBP=$$PT^IBEFUNC(DFN),IBPBN=$G(^IBA(354,DFN,0))
 Q