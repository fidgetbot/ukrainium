#!/usr/bin/env python3
import sys
from ukrainian_word_stress import Stressifier, StressSymbol

stressify = Stressifier(stress_symbol=StressSymbol.CombiningAcuteAccent)

for line in sys.stdin:
    text = line.rstrip('\n')
    print(stressify(text))
