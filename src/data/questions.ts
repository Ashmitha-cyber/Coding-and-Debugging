import { Question, LevelInfo } from '../types';

export const LEVEL_CONFIGS: Record<1 | 2 | 3, LevelInfo> = {
  1: {
    round: 1,
    levelName: 'BUG SCAN',
    subtitle: 'LEVEL 01 // FUNDAMENTALS',
    badge: 'BUG SCAN',
    accentColor: '#00f0ff',
    description: 'Detect bugs, identify syntax & runtime errors, and prove your debugging fundamentals.',
    objective: 'Eliminate 15 fundamental bugs across syntax, indentation, and conditional statements to stabilize the core arena compiler.',
    totalQuestions: 15,
    timeLimitSeconds: 1200, // 20 minutes
    levelCode: 'LVL-01-SCAN'
  },
  2: {
    round: 2,
    levelName: 'CODE REPAIR',
    subtitle: 'LEVEL 02 // LOGIC & RECONSTRUCTION',
    badge: 'CODE REPAIR',
    accentColor: '#ff9e00',
    description: 'Repair broken programs, understand complex logic, and eliminate hidden bugs.',
    objective: 'Reconstruct broken data transformations, recursive routines, dictionary mappings, and sorting algorithms under time pressure.',
    totalQuestions: 15,
    timeLimitSeconds: 1200, // 20 minutes
    levelCode: 'LVL-02-REPAIR'
  },
  3: {
    round: 3,
    levelName: 'BOSS ARENA',
    subtitle: 'LEVEL 03 // MASTER DEBUGGING',
    badge: 'BOSS ARENA',
    accentColor: '#a855f7',
    description: 'Face the hardest debugging challenges and conquer the final arena.',
    objective: 'Tackle advanced algorithms, binary search boundaries, deep cycle detectors, dynamic programming memoization, and complex edge cases.',
    totalQuestions: 15,
    timeLimitSeconds: 1200, // 20 minutes
    levelCode: 'LVL-03-BOSS'
  }
};

export const QUESTIONS: Question[] = [
  // ================= ROUND 1: EARTH ORBIT (1 to 15) =================
  {
    id: 1,
    round: 1,
    questionNumber: 1,
    title: 'Syntax Error in Launch System',
    category: 'Syntax Error',
    type: 'debugging',
    description: 'Correct the Python code so the countdown works correctly. The propulsion thrusters require an exact sequence of 5 initialization pulses before main engine start.',
    brokenCode: `for i in range(5)
    print(i)`,
    expectedAnswer: `for i in range(5):
    print(i)`,
    language: 'python',
    difficulty: 'easy',
    expectedOutput: "0\n1\n2\n3\n4",
    filename: 'root@odyssey:/systems/launch_seq.py',
    memoryLimit: '32MB',
    timeLimit: '1000ms',
    seqId: '9X-ALPHA',
    explanation: 'Added missing colon (:) after the for statement.'
  },
  {
    id: 2,
    round: 1,
    questionNumber: 2,
    title: 'Engine Status Telemetry Concatenation',
    category: 'Type Error',
    type: 'debugging',
    description: 'The telemetry broadcaster crashes when converting the status code to text. Fix the type error so the status string prints cleanly.',
    brokenCode: `status_code = 200
print("Engine Status: " + status_code)`,
    expectedAnswer: `status_code = 200
print("Engine Status: " + str(status_code))`,
    acceptedAnswers: [
      `status_code = 200\nprint(f"Engine Status: {status_code}")`,
      `status_code = 200\nprint("Engine Status:", status_code)`
    ],
    language: 'python',
    difficulty: 'easy',
    expectedOutput: 'Engine Status: 200',
    filename: 'root@odyssey:/systems/telemetry.py',
    memoryLimit: '32MB',
    timeLimit: '1000ms',
    seqId: '9X-BETA',
    explanation: 'Converted integer status_code to string with str() or formatted f-string.'
  },
  {
    id: 3,
    round: 1,
    questionNumber: 3,
    title: 'Liftoff Countdown Loop Logic',
    category: 'Loop Error',
    type: 'logic',
    description: 'The countdown must count backwards from 5 down to 1 (inclusive), then print "LIFTOFF". Fix the range step and stop value.',
    brokenCode: `for t in range(5, 1, 1):
    print(t)
print("LIFTOFF")`,
    expectedAnswer: `for t in range(5, 0, -1):
    print(t)
print("LIFTOFF")`,
    language: 'python',
    difficulty: 'easy',
    expectedOutput: "5\n4\n3\n2\n1\nLIFTOFF",
    filename: 'root@odyssey:/systems/countdown.py',
    memoryLimit: '32MB',
    timeLimit: '1000ms',
    seqId: '9X-GAMMA',
    explanation: 'Set the range parameters to (5, 0, -1) to count down through 1.'
  },
  {
    id: 4,
    round: 1,
    questionNumber: 4,
    title: 'Fuel Gauge Unbound Variable',
    category: 'Variable Scope',
    type: 'debugging',
    description: 'The fuel calculation uses an uninitialized variable "primary_fuel". Fix the variable name to match the tank reading "tank_a".',
    brokenCode: `tank_a = 450
tank_b = 350
total_fuel = primary_fuel + tank_b
print(f"Total Fuel: {total_fuel}L")`,
    expectedAnswer: `tank_a = 450
tank_b = 350
total_fuel = tank_a + tank_b
print(f"Total Fuel: {total_fuel}L")`,
    language: 'python',
    difficulty: 'easy',
    expectedOutput: 'Total Fuel: 800L',
    filename: 'root@odyssey:/systems/fuel_gauge.py',
    memoryLimit: '32MB',
    timeLimit: '1000ms',
    seqId: '9X-DELTA',
    explanation: 'Changed primary_fuel to tank_a.'
  },
  {
    id: 5,
    round: 1,
    questionNumber: 5,
    title: 'RCS Thruster Index Out of Range',
    category: 'Index Error',
    type: 'debugging',
    description: 'The pilot wants to trigger the last thruster in the 4-quadrant array. Fix the indexing error in the thruster array.',
    brokenCode: `thrusters = ["RCS_N", "RCS_E", "RCS_S", "RCS_W"]
active_thruster = thrusters[4]
print(f"Firing: {active_thruster}")`,
    expectedAnswer: `thrusters = ["RCS_N", "RCS_E", "RCS_S", "RCS_W"]
active_thruster = thrusters[3]
print(f"Firing: {active_thruster}")`,
    acceptedAnswers: [
      `thrusters = ["RCS_N", "RCS_E", "RCS_S", "RCS_W"]\nactive_thruster = thrusters[-1]\nprint(f"Firing: {active_thruster}")`
    ],
    language: 'python',
    difficulty: 'easy',
    expectedOutput: 'Firing: RCS_W',
    filename: 'root@odyssey:/systems/rcs_ctrl.py',
    memoryLimit: '32MB',
    timeLimit: '1000ms',
    seqId: '9X-EPSILON',
    explanation: 'Indices are 0 to 3. Changed thrusters[4] to thrusters[3] (or [-1]).'
  },
  {
    id: 6,
    round: 1,
    questionNumber: 6,
    title: 'Oxygen Level Safety Warning Condition',
    category: 'Condition Bug',
    type: 'logic',
    description: 'An emergency alert must trigger if O2 level drops below 21%. The current condition erroneously checks for greater than 21%. Fix the comparison operator.',
    brokenCode: `o2_level = 18.5
if o2_level > 21.0:
    print("WARNING: LOW OXYGEN")
else:
    print("OXYGEN NOMINAL")`,
    expectedAnswer: `o2_level = 18.5
if o2_level < 21.0:
    print("WARNING: LOW OXYGEN")
else:
    print("OXYGEN NOMINAL")`,
    language: 'python',
    difficulty: 'easy',
    expectedOutput: 'WARNING: LOW OXYGEN',
    filename: 'root@odyssey:/systems/life_support.py',
    memoryLimit: '32MB',
    timeLimit: '1000ms',
    seqId: '9X-ZETA',
    explanation: 'Changed > comparison to <.'
  },
  {
    id: 7,
    round: 1,
    questionNumber: 7,
    title: 'Unmatched Parentheses in Trajectory Calculation',
    category: 'Syntax Error',
    type: 'debugging',
    description: 'Fix the syntax error caused by unmatched brackets in the velocity orbital calculation formula.',
    brokenCode: `g_const = 9.81
mass = 5000
radius = 6371
velocity = ((g_const * mass) / radius
print(round(velocity, 2))`,
    expectedAnswer: `g_const = 9.81
mass = 5000
radius = 6371
velocity = ((g_const * mass) / radius)
print(round(velocity, 2))`,
    acceptedAnswers: [
      `g_const = 9.81\nmass = 5000\nradius = 6371\nvelocity = (g_const * mass) / radius\nprint(round(velocity, 2))`
    ],
    language: 'python',
    difficulty: 'easy',
    expectedOutput: '7.7',
    filename: 'root@odyssey:/systems/orbital_calc.py',
    memoryLimit: '32MB',
    timeLimit: '1000ms',
    seqId: '9X-ETA',
    explanation: 'Closed the unmatched opening parenthesis.'
  },
  {
    id: 8,
    round: 1,
    questionNumber: 8,
    title: 'Solar Array Voltage Variable Typo',
    category: 'Name Error',
    type: 'debugging',
    description: 'The solar voltage diagnostic fails due to a misspelled variable name. Correct the variable identifier in the calculation.',
    brokenCode: `panel_voltage = 48.0
panel_current = 6.5
total_power = panel_voltag * panel_current
print(f"Power: {total_power}W")`,
    expectedAnswer: `panel_voltage = 48.0
panel_current = 6.5
total_power = panel_voltage * panel_current
print(f"Power: {total_power}W")`,
    language: 'python',
    difficulty: 'easy',
    expectedOutput: 'Power: 312.0W',
    filename: 'root@odyssey:/systems/solar_diag.py',
    memoryLimit: '32MB',
    timeLimit: '1000ms',
    seqId: '9X-THETA',
    explanation: 'Corrected panel_voltag to panel_voltage.'
  },
  {
    id: 9,
    round: 1,
    questionNumber: 9,
    title: 'Heat Shield Pressure Threshold Logic',
    category: 'Boolean Logic',
    type: 'logic',
    description: 'The heat shield integrity check requires both pressure to be below 100 kPa AND temperature below 1500°C. Fix the boolean "or" to "and".',
    brokenCode: `pressure = 85
temperature = 1200
if pressure < 100 or temperature < 1500:
    # Both must pass, currently either passes
    pass

is_safe = pressure < 100 or temperature < 1500
print(f"Shield Safe: {is_safe}")`,
    expectedAnswer: `pressure = 85
temperature = 1200
is_safe = pressure < 100 and temperature < 1500
print(f"Shield Safe: {is_safe}")`,
    acceptedAnswers: [
      `pressure = 85\ntemperature = 1200\nif pressure < 100 and temperature < 1500:\n    is_safe = True\nelse:\n    is_safe = False\nprint(f"Shield Safe: {is_safe}")`
    ],
    language: 'python',
    difficulty: 'easy',
    expectedOutput: 'Shield Safe: True',
    filename: 'root@odyssey:/systems/heat_shield.py',
    memoryLimit: '32MB',
    timeLimit: '1000ms',
    seqId: '9X-IOTA',
    explanation: 'Used "and" so that both safety thresholds are strictly verified.'
  },
  {
    id: 10,
    round: 1,
    questionNumber: 10,
    title: 'Docking Clamp Alignment Indentation',
    category: 'Indentation Error',
    type: 'debugging',
    description: 'Fix the Python IndentationError in the docking clamp confirmation routine.',
    brokenCode: `def engage_docking_clamps():
print("Aligning magnets...")
print("Clamps LOCKED")

engage_docking_clamps()`,
    expectedAnswer: `def engage_docking_clamps():
    print("Aligning magnets...")
    print("Clamps LOCKED")

engage_docking_clamps()`,
    language: 'python',
    difficulty: 'easy',
    expectedOutput: "Aligning magnets...\nClamps LOCKED",
    filename: 'root@odyssey:/systems/docking_clamps.py',
    memoryLimit: '32MB',
    timeLimit: '1000ms',
    seqId: '9X-KAPPA',
    explanation: 'Indented the function body with 4 spaces.'
  },
  {
    id: 11,
    round: 1,
    questionNumber: 11,
    title: 'Telemetry Packet String Trimming',
    category: 'String Operation',
    type: 'completion',
    description: 'Clean the corrupted whitespace from the raw sensor stream using Python .strip() method before displaying.',
    brokenCode: `raw_packet = "   STATION_BEACON_ALPHA   "
clean_packet = raw_packet # TODO: trim leading and trailing spaces
print(f"Packet: [{clean_packet}]")`,
    expectedAnswer: `raw_packet = "   STATION_BEACON_ALPHA   "
clean_packet = raw_packet.strip()
print(f"Packet: [{clean_packet}]")`,
    language: 'python',
    difficulty: 'easy',
    expectedOutput: 'Packet: [STATION_BEACON_ALPHA]',
    filename: 'root@odyssey:/systems/packet_clean.py',
    memoryLimit: '32MB',
    timeLimit: '1000ms',
    seqId: '9X-LAMBDA',
    explanation: 'Called raw_packet.strip() to eliminate padding spaces.'
  },
  {
    id: 12,
    round: 1,
    questionNumber: 12,
    title: 'Even Pulse Modulo Filter',
    category: 'Arithmetic Bug',
    type: 'logic',
    description: 'Filter only even-numbered pulse frequencies from the signal array [1, 2, 3, 4, 5, 6]. Fix the incorrect modulo condition.',
    brokenCode: `pulses = [1, 2, 3, 4, 5, 6]
even_pulses = []
for p in pulses:
    if p % 2 != 0: # Bug: Currently picking odd pulses
        even_pulses.append(p)
print(even_pulses)`,
    expectedAnswer: `pulses = [1, 2, 3, 4, 5, 6]
even_pulses = []
for p in pulses:
    if p % 2 == 0:
        even_pulses.append(p)
print(even_pulses)`,
    acceptedAnswers: [
      `pulses = [1, 2, 3, 4, 5, 6]\neven_pulses = [p for p in pulses if p % 2 == 0]\nprint(even_pulses)`
    ],
    language: 'python',
    difficulty: 'easy',
    expectedOutput: '[2, 4, 6]',
    filename: 'root@odyssey:/systems/pulse_filter.py',
    memoryLimit: '32MB',
    timeLimit: '1000ms',
    seqId: '9X-MU',
    explanation: 'Changed p % 2 != 0 to p % 2 == 0.'
  },
  {
    id: 13,
    round: 1,
    questionNumber: 13,
    title: 'Air Pressure Equalizer Infinite Loop',
    category: 'Loop Error',
    type: 'logic',
    description: 'The pressure equalization while loop hangs in an infinite loop because the pressure variable is never incremented. Add the increment statement.',
    brokenCode: `chamber_pressure = 70
target_pressure = 100
cycles = 0

while chamber_pressure < target_pressure:
    cycles += 1
    # chamber_pressure is not updating!

print(f"Equalized in {cycles} cycles. Pressure: {chamber_pressure} kPa")`,
    expectedAnswer: `chamber_pressure = 70
target_pressure = 100
cycles = 0

while chamber_pressure < target_pressure:
    cycles += 1
    chamber_pressure += 10

print(f"Equalized in {cycles} cycles. Pressure: {chamber_pressure} kPa")`,
    language: 'python',
    difficulty: 'easy',
    expectedOutput: 'Equalized in 3 cycles. Pressure: 100 kPa',
    filename: 'root@odyssey:/systems/air_equalizer.py',
    memoryLimit: '32MB',
    timeLimit: '1000ms',
    seqId: '9X-NU',
    explanation: 'Added chamber_pressure += 10 inside the loop.'
  },
  {
    id: 14,
    round: 1,
    questionNumber: 14,
    title: 'Radar Target List Append Method',
    category: 'List Method',
    type: 'debugging',
    description: 'The radar detection script attempts to add a new contact using an invalid assignment. Fix it using list .append().',
    brokenCode: `targets = ["DEBRIS_01", "SATELLITE_4"]
# Fix invalid list addition:
targets.add("ISS_MODULE")
print(targets)`,
    expectedAnswer: `targets = ["DEBRIS_01", "SATELLITE_4"]
targets.append("ISS_MODULE")
print(targets)`,
    language: 'python',
    difficulty: 'easy',
    expectedOutput: "['DEBRIS_01', 'SATELLITE_4', 'ISS_MODULE']",
    filename: 'root@odyssey:/systems/radar_log.py',
    memoryLimit: '32MB',
    timeLimit: '1000ms',
    seqId: '9X-XI',
    explanation: 'Python lists use .append(), not .add().'
  },
  {
    id: 15,
    round: 1,
    questionNumber: 15,
    title: 'Approach Velocity Function Return',
    category: 'Function Return',
    type: 'debugging',
    description: 'The function calculate_approach_speed computes the speed but returns None because the return statement is missing. Add the return statement.',
    brokenCode: `def calculate_approach_speed(distance_km, time_min):
    speed_kmh = (distance_km / time_min) * 60
    # Missing return!

v = calculate_approach_speed(30, 15)
print(f"Approach Speed: {v} km/h")`,
    expectedAnswer: `def calculate_approach_speed(distance_km, time_min):
    speed_kmh = (distance_km / time_min) * 60
    return speed_kmh

v = calculate_approach_speed(30, 15)
print(f"Approach Speed: {v} km/h")`,
    language: 'python',
    difficulty: 'easy',
    expectedOutput: 'Approach Speed: 120.0 km/h',
    filename: 'root@odyssey:/systems/approach_speed.py',
    memoryLimit: '32MB',
    timeLimit: '1000ms',
    seqId: '9X-OMICRON',
    explanation: 'Added return speed_kmh inside the function.'
  },

  // ================= ROUND 2: MARS MISSION (16 to 30) =================
  {
    id: 16,
    round: 2,
    questionNumber: 1,
    title: 'Mars Transit Delta-V Calculation',
    category: 'Math Formula',
    type: 'debugging',
    description: 'Calculate the total delta-V requirement by taking the sum of injection burn and insertion burn. Fix the division bug causing integer truncation.',
    brokenCode: `burn_1 = 3600
burn_2 = 2100
# Calculate average thrust efficiency (sum divided by 2):
avg_burn = (burn_1 + burn_2) // 4  # Bug: wrong divisor
print(f"Mean Burn: {avg_burn} m/s")`,
    expectedAnswer: `burn_1 = 3600
burn_2 = 2100
avg_burn = (burn_1 + burn_2) // 2
print(f"Mean Burn: {avg_burn} m/s")`,
    acceptedAnswers: [
      `burn_1 = 3600\nburn_2 = 2100\navg_burn = int((burn_1 + burn_2) / 2)\nprint(f"Mean Burn: {avg_burn} m/s")`
    ],
    language: 'python',
    difficulty: 'medium',
    expectedOutput: 'Mean Burn: 2850 m/s',
    filename: 'root@odyssey:/systems/mars_burn.py',
    memoryLimit: '64MB',
    timeLimit: '1000ms',
    seqId: '8M-ALPHA',
    explanation: 'Corrected divisor from 4 to 2.'
  },
  {
    id: 17,
    round: 2,
    questionNumber: 2,
    title: 'Life Support Subsystem Key Error',
    category: 'Dictionary Lookup',
    type: 'debugging',
    description: 'The telemetry script raises a KeyError when accessing environmental telemetry. Fix the dictionary key to "co2_scrubber".',
    brokenCode: `telemetry = {
    "o2_generator": "NOMINAL",
    "co2_scrubber": "ACTIVE",
    "humidity_ctrl": "STABLE"
}
# Bug: misspelled key
status = telemetry["co2_scruber"]
print(f"Scrubber: {status}")`,
    expectedAnswer: `telemetry = {
    "o2_generator": "NOMINAL",
    "co2_scrubber": "ACTIVE",
    "humidity_ctrl": "STABLE"
}
status = telemetry["co2_scrubber"]
print(f"Scrubber: {status}")`,
    language: 'python',
    difficulty: 'medium',
    expectedOutput: 'Scrubber: ACTIVE',
    filename: 'root@odyssey:/systems/scrubber_diag.py',
    memoryLimit: '64MB',
    timeLimit: '1000ms',
    seqId: '8M-BETA',
    explanation: 'Fixed key spelling from "co2_scruber" to "co2_scrubber".'
  },
  {
    id: 18,
    round: 2,
    questionNumber: 3,
    title: 'Cosmic Radiation Spike Filter',
    category: 'List Comprehension',
    type: 'completion',
    description: 'Filter out all radiation sensor readings greater than 50.0 mSv from the sensor list [24.5, 62.1, 19.8, 88.0, 41.2, 53.4].',
    brokenCode: `readings = [24.5, 62.1, 19.8, 88.0, 41.2, 53.4]
# Filter to only keep readings <= 50.0
safe_readings = []
for r in readings:
    # Fill in condition
    pass
print(safe_readings)`,
    expectedAnswer: `readings = [24.5, 62.1, 19.8, 88.0, 41.2, 53.4]
safe_readings = [r for r in readings if r <= 50.0]
print(safe_readings)`,
    acceptedAnswers: [
      `readings = [24.5, 62.1, 19.8, 88.0, 41.2, 53.4]\nsafe_readings = []\nfor r in readings:\n    if r <= 50.0:\n        safe_readings.append(r)\nprint(safe_readings)`
    ],
    language: 'python',
    difficulty: 'medium',
    expectedOutput: '[24.5, 19.8, 41.2]',
    filename: 'root@odyssey:/systems/rad_filter.py',
    memoryLimit: '64MB',
    timeLimit: '1000ms',
    seqId: '8M-GAMMA',
    explanation: 'Filtered list using condition r <= 50.0.'
  },
  {
    id: 19,
    round: 2,
    questionNumber: 4,
    title: 'Recursive Ion Thruster Stage Countdown',
    category: 'Recursion Bug',
    type: 'debugging',
    description: 'The recursive countdown function causes a RecursionError (stack overflow) because it lacks a base case when stage reaches 0. Add the base condition.',
    brokenCode: `def stage_burn(stage):
    # Missing base case!
    print(f"Stage {stage} primed")
    return stage_burn(stage - 1)

stage_burn(3)`,
    expectedAnswer: `def stage_burn(stage):
    if stage <= 0:
        print("All stages complete")
        return
    print(f"Stage {stage} primed")
    return stage_burn(stage - 1)

stage_burn(3)`,
    acceptedAnswers: [
      `def stage_burn(stage):\n    if stage == 0:\n        print("All stages complete")\n        return\n    print(f"Stage {stage} primed")\n    stage_burn(stage - 1)\n\nstage_burn(3)`
    ],
    language: 'python',
    difficulty: 'medium',
    expectedOutput: "Stage 3 primed\nStage 2 primed\nStage 1 primed\nAll stages complete",
    filename: 'root@odyssey:/systems/stage_burn.py',
    memoryLimit: '64MB',
    timeLimit: '1000ms',
    seqId: '8M-DELTA',
    explanation: 'Added base case if stage <= 0: return.'
  },
  {
    id: 20,
    round: 2,
    questionNumber: 5,
    title: 'Planetary Message Morse Decoder',
    category: 'String Manipulation',
    type: 'logic',
    description: 'The signal parser splits a hyphen-delimited string of Mars coordinates "MARS-SECTOR-04-NORTH". Fix the delimiter in .split() so it creates a clean list.',
    brokenCode: `raw_coord = "MARS-SECTOR-04-NORTH"
# Bug: splitting by space instead of hyphen
parts = raw_coord.split(" ")
print(parts)`,
    expectedAnswer: `raw_coord = "MARS-SECTOR-04-NORTH"
parts = raw_coord.split("-")
print(parts)`,
    language: 'python',
    difficulty: 'medium',
    expectedOutput: "['MARS', 'SECTOR', '04', 'NORTH']",
    filename: 'root@odyssey:/systems/mars_decoder.py',
    memoryLimit: '64MB',
    timeLimit: '1000ms',
    seqId: '8M-EPSILON',
    explanation: 'Changed split delimiter from " " to "-".'
  },
  {
    id: 21,
    round: 2,
    questionNumber: 6,
    title: 'Rover Battery Pack Capacity Aggregator',
    category: 'Dictionary Aggregation',
    type: 'completion',
    description: 'Calculate the total available watt-hours across all 3 rover battery cells stored in a dictionary.',
    brokenCode: `batteries = {"cell_a": 120, "cell_b": 115, "cell_c": 135}
# Calculate total capacity
total_wh = 0
for cell, wh in batteries.items():
    # accumulate wh
    pass
print(f"Total Capacity: {total_wh} Wh")`,
    expectedAnswer: `batteries = {"cell_a": 120, "cell_b": 115, "cell_c": 135}
total_wh = sum(batteries.values())
print(f"Total Capacity: {total_wh} Wh")`,
    acceptedAnswers: [
      `batteries = {"cell_a": 120, "cell_b": 115, "cell_c": 135}\ntotal_wh = 0\nfor cell, wh in batteries.items():\n    total_wh += wh\nprint(f"Total Capacity: {total_wh} Wh")`
    ],
    language: 'python',
    difficulty: 'medium',
    expectedOutput: 'Total Capacity: 370 Wh',
    filename: 'root@odyssey:/systems/rover_battery.py',
    memoryLimit: '64MB',
    timeLimit: '1000ms',
    seqId: '8M-ZETA',
    explanation: 'Aggregated values using sum(batteries.values()) or total_wh += wh.'
  },
  {
    id: 22,
    round: 2,
    questionNumber: 7,
    title: 'Mars Landing Grid Matrix Search',
    category: 'Nested Loops',
    type: 'logic',
    description: 'Find the coordinates (row, col) of the landing site marker "X" in a 3x3 topographic grid.',
    brokenCode: `grid = [
    [".", ".", "."],
    [".", "X", "."],
    [".", ".", "."]
]
target_pos = None
for r in range(len(grid)):
    for c in range(len(grid[r])):
        if grid[r][c] == "O": # Bug: checking for 'O' instead of 'X'
            target_pos = (r, c)
print(f"Landing Site Found At: {target_pos}")`,
    expectedAnswer: `grid = [
    [".", ".", "."],
    [".", "X", "."],
    [".", ".", "."]
]
target_pos = None
for r in range(len(grid)):
    for c in range(len(grid[r])):
        if grid[r][c] == "X":
            target_pos = (r, c)
print(f"Landing Site Found At: {target_pos}")`,
    language: 'python',
    difficulty: 'medium',
    expectedOutput: 'Landing Site Found At: (1, 1)',
    filename: 'root@odyssey:/systems/landing_grid.py',
    memoryLimit: '64MB',
    timeLimit: '1000ms',
    seqId: '8M-ETA',
    explanation: 'Changed comparison value from "O" to "X".'
  },
  {
    id: 23,
    round: 2,
    questionNumber: 8,
    title: 'Mutable Default Argument in Telemetry Buffer',
    category: 'Function Defaults',
    type: 'debugging',
    description: 'A classic Python bug: using a mutable list as default parameter causes data to leak across calls. Fix the default argument to None and initialize inside.',
    brokenCode: `def log_event(event_id, event_log=[]):
    event_log.append(event_id)
    return event_log

print(log_event("SYS_BOOT"))
print(log_event("NAV_LOCK"))`,
    expectedAnswer: `def log_event(event_id, event_log=None):
    if event_log is None:
        event_log = []
    event_log.append(event_id)
    return event_log

print(log_event("SYS_BOOT"))
print(log_event("NAV_LOCK"))`,
    language: 'python',
    difficulty: 'medium',
    expectedOutput: "['SYS_BOOT']\n['NAV_LOCK']",
    filename: 'root@odyssey:/systems/event_buffer.py',
    memoryLimit: '64MB',
    timeLimit: '1000ms',
    seqId: '8M-THETA',
    explanation: 'Replaced mutable default [] with None and initialized inside the function.'
  },
  {
    id: 24,
    round: 2,
    questionNumber: 9,
    title: 'Peak Solar Flare Detector',
    category: 'Algorithm',
    type: 'completion',
    description: 'Find and return the maximum flare intensity and its index in the sensor recording stream [120, 340, 890, 450, 210].',
    brokenCode: `flares = [120, 340, 890, 450, 210]
max_flare = 0
max_idx = -1

for i, flare in enumerate(flares):
    # TODO: check if flare > max_flare and update max_flare and max_idx
    pass

print(f"Peak: {max_flare} at index {max_idx}")`,
    expectedAnswer: `flares = [120, 340, 890, 450, 210]
max_flare = 0
max_idx = -1

for i, flare in enumerate(flares):
    if flare > max_flare:
        max_flare = flare
        max_idx = i

print(f"Peak: {max_flare} at index {max_idx}")`,
    language: 'python',
    difficulty: 'medium',
    expectedOutput: 'Peak: 890 at index 2',
    filename: 'root@odyssey:/systems/flare_peak.py',
    memoryLimit: '64MB',
    timeLimit: '1000ms',
    seqId: '8M-IOTA',
    explanation: 'Updated max_flare and max_idx when a higher value is found.'
  },
  {
    id: 25,
    round: 2,
    questionNumber: 10,
    title: 'Thermal Sensor Anomaly Sorter',
    category: 'Sorting & Lambdas',
    type: 'logic',
    description: 'Sort the temperature probe records by deviation from 0°C descending (highest absolute deviation first).',
    brokenCode: `probes = [("P1", -45), ("P2", 12), ("P3", -88), ("P4", 64)]
# Sort by absolute temperature descending
sorted_probes = sorted(probes, key=lambda x: x[1])
print(sorted_probes)`,
    expectedAnswer: `probes = [("P1", -45), ("P2", 12), ("P3", -88), ("P4", 64)]
sorted_probes = sorted(probes, key=lambda x: abs(x[1]), reverse=True)
print(sorted_probes)`,
    language: 'python',
    difficulty: 'medium',
    expectedOutput: "[('P3', -88), ('P4', 64), ('P1', -45), ('P2', 12)]",
    filename: 'root@odyssey:/systems/thermal_sort.py',
    memoryLimit: '64MB',
    timeLimit: '1000ms',
    seqId: '8M-KAPPA',
    explanation: 'Used key=lambda x: abs(x[1]) with reverse=True.'
  },
  {
    id: 26,
    round: 2,
    questionNumber: 11,
    title: 'Guidance Vector Non-Destructive Inversion',
    category: 'List Slicing',
    type: 'completion',
    description: 'Create an inverted guidance vector trajectory [10, 20, 30, 40] using Python slice notation [::-1] without mutating the original list.',
    brokenCode: `forward_vec = [10, 20, 30, 40]
# Return reversed copy without modifying forward_vec
reverse_vec = forward_vec # fix with slice
print(f"Original: {forward_vec}")
print(f"Reversed: {reverse_vec}")`,
    expectedAnswer: `forward_vec = [10, 20, 30, 40]
reverse_vec = forward_vec[::-1]
print(f"Original: {forward_vec}")
print(f"Reversed: {reverse_vec}")`,
    language: 'python',
    difficulty: 'medium',
    expectedOutput: "Original: [10, 20, 30, 40]\nReversed: [40, 30, 20, 10]",
    filename: 'root@odyssey:/systems/guidance_inv.py',
    memoryLimit: '64MB',
    timeLimit: '1000ms',
    seqId: '8M-LAMBDA',
    explanation: 'Used slicing forward_vec[::-1] to create a reversed copy.'
  },
  {
    id: 27,
    round: 2,
    questionNumber: 12,
    title: 'Interstellar Radio Frequency Matching',
    category: 'Set Intersection',
    type: 'logic',
    description: 'Identify common communication frequencies between the orbiter channels {1420, 1665, 4830} and lander receiver channels {1210, 1420, 4830, 8400}.',
    brokenCode: `orbiter_freqs = {1420, 1665, 4830}
lander_freqs = {1210, 1420, 4830, 8400}
# Bug: using union instead of intersection
common_freqs = orbiter_freqs.union(lander_freqs)
print(sorted(list(common_freqs)))`,
    expectedAnswer: `orbiter_freqs = {1420, 1665, 4830}
lander_freqs = {1210, 1420, 4830, 8400}
common_freqs = orbiter_freqs.intersection(lander_freqs)
print(sorted(list(common_freqs)))`,
    acceptedAnswers: [
      `orbiter_freqs = {1420, 1665, 4830}\nlander_freqs = {1210, 1420, 4830, 8400}\ncommon_freqs = orbiter_freqs & lander_freqs\nprint(sorted(list(common_freqs)))`
    ],
    language: 'python',
    difficulty: 'medium',
    expectedOutput: '[1420, 4830]',
    filename: 'root@odyssey:/systems/radio_match.py',
    memoryLimit: '64MB',
    timeLimit: '1000ms',
    seqId: '8M-MU',
    explanation: 'Replaced .union() with .intersection() (or &).'
  },
  {
    id: 28,
    round: 2,
    questionNumber: 13,
    title: 'Mars Atmospheric Deceleration Drag Scale',
    category: 'Math Logic',
    type: 'debugging',
    description: 'Calculate aerodynamic drag: D = 0.5 * rho * v^2 * Cd * A. Fix the exponent operator in Python from ^ (bitwise XOR) to ** (power).',
    brokenCode: `rho = 0.02   # Mars air density
v = 4000     # Velocity m/s
Cd = 1.2     # Drag coefficient
A = 15.0     # Area m^2

# Bug: In python ^ is XOR, not exponent!
drag = 0.5 * rho * (v ^ 2) * Cd * A
print(f"Drag Force: {round(drag, 1)} N")`,
    expectedAnswer: `rho = 0.02
v = 4000
Cd = 1.2
A = 15.0

drag = 0.5 * rho * (v ** 2) * Cd * A
print(f"Drag Force: {round(drag, 1)} N")`,
    language: 'python',
    difficulty: 'medium',
    expectedOutput: 'Drag Force: 2880000.0 N',
    filename: 'root@odyssey:/systems/aero_drag.py',
    memoryLimit: '64MB',
    timeLimit: '1000ms',
    seqId: '8M-NU',
    explanation: 'Replaced (v ^ 2) with (v ** 2).'
  },
  {
    id: 29,
    round: 2,
    questionNumber: 14,
    title: 'Celestial Coordinate Tuple Unpacking',
    category: 'Tuple Unpacking',
    type: 'debugging',
    description: 'The celestial coordinate tuple contains 3 elements (Right Ascension, Declination, Epoch). Fix the unpacking assignment that expects only 2 values.',
    brokenCode: `star_coords = (18.61, 38.78, 2000.0)
# Bug: Value error on unpacking 3 elements into 2 variables
ra, dec = star_coords
print(f"RA: {ra}, DEC: {dec}")`,
    expectedAnswer: `star_coords = (18.61, 38.78, 2000.0)
ra, dec, epoch = star_coords
print(f"RA: {ra}, DEC: {dec}")`,
    acceptedAnswers: [
      `star_coords = (18.61, 38.78, 2000.0)\nra, dec, _ = star_coords\nprint(f"RA: {ra}, DEC: {dec}")`
    ],
    language: 'python',
    difficulty: 'medium',
    expectedOutput: 'RA: 18.61, DEC: 38.78',
    filename: 'root@odyssey:/systems/celestial_nav.py',
    memoryLimit: '64MB',
    timeLimit: '1000ms',
    seqId: '8M-XI',
    explanation: 'Unpacked all 3 elements: ra, dec, epoch = star_coords.'
  },
  {
    id: 30,
    round: 2,
    questionNumber: 15,
    title: 'Zero-Gravity Fuel Flow Safe Division',
    category: 'Exception Handling',
    type: 'completion',
    description: 'Prevent ZeroDivisionError when sensor time_elapsed is 0.0 by handling it safely and returning 0.0 flow rate.',
    brokenCode: `def calculate_fuel_flow(fuel_mass, time_elapsed):
    # If time_elapsed is 0, return 0.0 safely
    return fuel_mass / time_elapsed

print(calculate_fuel_flow(500, 10))
print(calculate_fuel_flow(500, 0))`,
    expectedAnswer: `def calculate_fuel_flow(fuel_mass, time_elapsed):
    if time_elapsed == 0:
        return 0.0
    return fuel_mass / time_elapsed

print(calculate_fuel_flow(500, 10))
print(calculate_fuel_flow(500, 0))`,
    acceptedAnswers: [
      `def calculate_fuel_flow(fuel_mass, time_elapsed):\n    try:\n        return fuel_mass / time_elapsed\n    except ZeroDivisionError:\n        return 0.0\n\nprint(calculate_fuel_flow(500, 10))\nprint(calculate_fuel_flow(500, 0))`
    ],
    language: 'python',
    difficulty: 'medium',
    expectedOutput: "50.0\n0.0",
    filename: 'root@odyssey:/systems/fuel_flow.py',
    memoryLimit: '64MB',
    timeLimit: '1000ms',
    seqId: '8M-OMICRON',
    explanation: 'Added guard condition if time_elapsed == 0: return 0.0.'
  },

  // ================= ROUND 3: DEEP SPACE GATEWAY (31 to 45) =================
  {
    id: 31,
    round: 3,
    questionNumber: 1,
    title: 'Pulsar Frequency Binary Search Algorithm',
    category: 'Algorithms',
    type: 'debugging',
    description: 'Locate target beacon frequency in a sorted spectrum array using binary search. Fix the pointer update bug that leads to an infinite loop.',
    brokenCode: `def search_pulsar(freqs, target):
    low = 0
    high = len(freqs) - 1
    while low <= high:
        mid = (low + high) // 2
        if freqs[mid] == target:
            return mid
        elif freqs[mid] < target:
            low = mid  # Bug: should be mid + 1
        else:
            high = mid - 1
    return -1

frequencies = [104.2, 218.7, 345.1, 412.9, 580.4, 712.3]
print(search_pulsar(frequencies, 412.9))`,
    expectedAnswer: `def search_pulsar(freqs, target):
    low = 0
    high = len(freqs) - 1
    while low <= high:
        mid = (low + high) // 2
        if freqs[mid] == target:
            return mid
        elif freqs[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1

frequencies = [104.2, 218.7, 345.1, 412.9, 580.4, 712.3]
print(search_pulsar(frequencies, 412.9))`,
    language: 'python',
    difficulty: 'hard',
    expectedOutput: '3',
    filename: 'root@odyssey:/systems/pulsar_search.py',
    memoryLimit: '128MB',
    timeLimit: '1000ms',
    seqId: '7D-ALPHA',
    explanation: 'In standard binary search, when freqs[mid] < target, the search window must eliminate mid by advancing "low = mid + 1". Setting "low = mid" causes an infinite loop whenever low + 1 == high because mid evaluates to low repeatedly.'
  },
  {
    id: 32,
    round: 3,
    questionNumber: 2,
    title: 'Emergency Priority Queue Dispatcher',
    category: 'Data Structures',
    type: 'logic',
    description: 'Dispatch alerts by priority (lowest numeric rank = highest urgency, e.g. Priority 1 before Priority 3). Sort the queue correctly.',
    brokenCode: `alerts = [
    ("O2_SCRUBBER_WARN", 2),
    ("HULL_BREACH_CRITICAL", 1),
    ("COMM_LATENCY", 3)
]
# Fix sorting order so priority 1 comes first:
alerts.sort(key=lambda x: x[1], reverse=True) # Bug: reverse order
for alert, prio in alerts:
    print(f"[{prio}] {alert}")`,
    expectedAnswer: `alerts = [
    ("O2_SCRUBBER_WARN", 2),
    ("HULL_BREACH_CRITICAL", 1),
    ("COMM_LATENCY", 3)
]
alerts.sort(key=lambda x: x[1])
for alert, prio in alerts:
    print(f"[{prio}] {alert}")`,
    language: 'python',
    difficulty: 'hard',
    expectedOutput: "[1] HULL_BREACH_CRITICAL\n[2] O2_SCRUBBER_WARN\n[3] COMM_LATENCY",
    filename: 'root@odyssey:/systems/priority_dispatch.py',
    memoryLimit: '128MB',
    timeLimit: '1000ms',
    seqId: '7D-BETA',
    explanation: 'Urgent alerts are ordered in ascending rank (Priority 1 before Priority 3). The broken code specified reverse=True which placed lower-priority alerts first. Removing reverse=True sorts in ascending order.'
  },
  {
    id: 33,
    round: 3,
    questionNumber: 3,
    title: 'Gravitational Sensor Matrix Transposition',
    category: 'Matrix Transformation',
    type: 'completion',
    description: 'Transpose a 2x3 tensor matrix into a 3x2 matrix using list comprehension.',
    brokenCode: `matrix = [
    [1, 2, 3],
    [4, 5, 6]
]
# Transpose matrix to [[1, 4], [2, 5], [3, 6]]
transposed = []
# TODO: generate transposed matrix
print(transposed)`,
    expectedAnswer: `matrix = [
    [1, 2, 3],
    [4, 5, 6]
]
transposed = [[row[i] for row in matrix] for i in range(len(matrix[0]))]
print(transposed)`,
    acceptedAnswers: [
      `matrix = [\n    [1, 2, 3],\n    [4, 5, 6]\n]\ntransposed = [list(x) for x in zip(*matrix)]\nprint(transposed)`
    ],
    language: 'python',
    difficulty: 'hard',
    expectedOutput: '[[1, 4], [2, 5], [3, 6]]',
    filename: 'root@odyssey:/systems/matrix_tensor.py',
    memoryLimit: '128MB',
    timeLimit: '1000ms',
    seqId: '7D-GAMMA',
    explanation: 'To transpose an M×N matrix into N×M, iterate outer index i through range(len(matrix[0])) and extract row[i] for each row in matrix: [[row[i] for row in matrix] for i in range(len(matrix[0]))] or use list(zip(*matrix)).'
  },
  {
    id: 34,
    round: 3,
    questionNumber: 4,
    title: 'Quantum Key Parity Checksum Validation',
    category: 'Bitwise / Parity',
    type: 'debugging',
    description: 'Validate quantum key parity: sum of bits must be even. Fix the parity check logic.',
    brokenCode: `def is_valid_quantum_key(bitstring):
    ones_count = bitstring.count("1")
    # Valid if parity is even (ones_count % 2 == 0)
    return ones_count % 2 != 0  # Bug!

print(is_valid_quantum_key("11010011"))
print(is_valid_quantum_key("11100000"))`,
    expectedAnswer: `def is_valid_quantum_key(bitstring):
    ones_count = bitstring.count("1")
    return ones_count % 2 == 0

print(is_valid_quantum_key("11010011"))
print(is_valid_quantum_key("11100000"))`,
    language: 'python',
    difficulty: 'hard',
    expectedOutput: "False\nFalse",
    filename: 'root@odyssey:/systems/quantum_key.py',
    memoryLimit: '128MB',
    timeLimit: '1000ms',
    seqId: '7D-DELTA',
    explanation: 'Even parity requires the count of "1" bits to be divisible by 2 (ones_count % 2 == 0). The buggy condition returned ones_count % 2 != 0, checking for odd parity instead of even parity.'
  },
  {
    id: 35,
    round: 3,
    questionNumber: 5,
    title: 'Wormhole Waypoint Cycle Detection',
    category: 'Graph Traversal',
    type: 'debugging',
    description: 'Detect whether a sequence of waypoints revisits an already explored node. Fix visited set check.',
    brokenCode: `def has_cycle(path):
    visited = set()
    for node in path:
        if node in visited:
            return True
        # Bug: forgetting to record visited node!
    return False

print(has_cycle(["GATE_A", "GATE_B", "GATE_C", "GATE_A"]))
print(has_cycle(["GATE_A", "GATE_B", "GATE_C"]))`,
    expectedAnswer: `def has_cycle(path):
    visited = set()
    for node in path:
        if node in visited:
            return True
        visited.add(node)
    return False

print(has_cycle(["GATE_A", "GATE_B", "GATE_C", "GATE_A"]))
print(has_cycle(["GATE_A", "GATE_B", "GATE_C"]))`,
    language: 'python',
    difficulty: 'hard',
    expectedOutput: "True\nFalse",
    filename: 'root@odyssey:/systems/wormhole_cycle.py',
    memoryLimit: '128MB',
    timeLimit: '1000ms',
    seqId: '7D-EPSILON',
    explanation: 'Cycle detection requires recording each visited node into the set with visited.add(node). Without recording, the lookup "if node in visited" never evaluates to True.'
  },
  {
    id: 36,
    round: 3,
    questionNumber: 6,
    title: 'Navigation Subtree Max Depth',
    category: 'Trees / Recursion',
    type: 'debugging',
    description: 'Compute maximum depth of hierarchical waypoint tree. Fix the depth calculation formula.',
    brokenCode: `tree = {
    "val": "GATEWAY",
    "left": {"val": "RELAY_1", "left": None, "right": None},
    "right": {"val": "RELAY_2", "left": {"val": "BEACON_X", "left": None, "right": None}, "right": None}
}

def max_depth(root):
    if not root:
        return 0
    # Bug: Taking min instead of max
    return 1 + min(max_depth(root["left"]), max_depth(root["right"]))

print(f"Tree Depth: {max_depth(tree)}")`,
    expectedAnswer: `tree = {
    "val": "GATEWAY",
    "left": {"val": "RELAY_1", "left": None, "right": None},
    "right": {"val": "RELAY_2", "left": {"val": "BEACON_X", "left": None, "right": None}, "right": None}
}

def max_depth(root):
    if not root:
        return 0
    return 1 + max(max_depth(root["left"]), max_depth(root["right"]))

print(f"Tree Depth: {max_depth(tree)}")`,
    language: 'python',
    difficulty: 'hard',
    expectedOutput: 'Tree Depth: 3',
    filename: 'root@odyssey:/systems/waypoint_tree.py',
    memoryLimit: '128MB',
    timeLimit: '1000ms',
    seqId: '7D-ZETA',
    explanation: 'The maximum depth of a binary tree is 1 + max(left_depth, right_depth). The buggy code used min(), which ignored the deeper right subtree branch. Changed min() to max().'
  },
  {
    id: 37,
    round: 3,
    questionNumber: 7,
    title: 'Sliding Window Energy Burst Peak',
    category: 'Sliding Window',
    type: 'completion',
    description: 'Find the maximum sum of any contiguous window of size 3 in the stream [10, 40, 20, 80, 50, 30].',
    brokenCode: `stream = [10, 40, 20, 80, 50, 30]
k = 3
# Find max sum of subarray of size k
max_sum = 0
for i in range(len(stream) - k + 1):
    # TODO: compute window sum and update max_sum
    pass

print(f"Max 3-Burst Energy: {max_sum}")`,
    expectedAnswer: `stream = [10, 40, 20, 80, 50, 30]
k = 3
max_sum = 0
for i in range(len(stream) - k + 1):
    current_sum = sum(stream[i:i+k])
    if current_sum > max_sum:
        max_sum = current_sum

print(f"Max 3-Burst Energy: {max_sum}")`,
    acceptedAnswers: [
      `stream = [10, 40, 20, 80, 50, 30]\nk = 3\nmax_sum = max(sum(stream[i:i+k]) for i in range(len(stream) - k + 1))\nprint(f"Max 3-Burst Energy: {max_sum}")`
    ],
    language: 'python',
    difficulty: 'hard',
    expectedOutput: 'Max 3-Burst Energy: 160',
    filename: 'root@odyssey:/systems/sliding_energy.py',
    memoryLimit: '128MB',
    timeLimit: '1000ms',
    seqId: '7D-ETA',
    explanation: 'Evaluated each 3-element contiguous window: [10,40,20]=70, [40,20,80]=140, [20,80,50]=150, [80,50,30]=160. The peak burst energy is 160.'
  },
  {
    id: 38,
    round: 3,
    questionNumber: 8,
    title: 'Telemetry Run-Length Compression Decoder',
    category: 'String Algorithms',
    type: 'debugging',
    description: 'Decode run-length encoded sensor signals like "3A2B4C" to "AAABBCCCC". Fix string integer parsing.',
    brokenCode: `def decode_rle(encoded):
    result = ""
    i = 0
    while i < len(encoded):
        count = encoded[i]  # Bug: string instead of int
        char = encoded[i+1]
        result += char * int(count)
        i += 2
    return result

print(decode_rle("3A2B4C"))`,
    expectedAnswer: `def decode_rle(encoded):
    result = ""
    i = 0
    while i < len(encoded):
        count = int(encoded[i])
        char = encoded[i+1]
        result += char * count
        i += 2
    return result

print(decode_rle("3A2B4C"))`,
    language: 'python',
    difficulty: 'hard',
    expectedOutput: 'AAABBCCCC',
    filename: 'root@odyssey:/systems/rle_decoder.py',
    memoryLimit: '128MB',
    timeLimit: '1000ms',
    seqId: '7D-THETA',
    explanation: 'In Run-Length Decoding, the multiplier at encoded[i] must be parsed as an integer (int(encoded[i])) so string multiplication char * count expands "3" * "A" into "AAA".'
  },
  {
    id: 39,
    round: 3,
    questionNumber: 9,
    title: 'Cache LRU Eviction Tracker',
    category: 'Data Structures',
    type: 'debugging',
    description: 'Maintain a 3-item LRU cache using a list. When accessing an existing item, move it to the most recently used (end) position. Fix the index lookup.',
    brokenCode: `cache = ["PKT_1", "PKT_2", "PKT_3"]

def access_packet(pkt):
    if pkt in cache:
        cache.remove(pkt)
        cache.append(pkt)
    else:
        if len(cache) >= 3:
            # Bug: pop from end instead of oldest at index 0!
            cache.pop() 
        cache.append(pkt)

access_packet("PKT_4")
print(cache)`,
    expectedAnswer: `cache = ["PKT_1", "PKT_2", "PKT_3"]

def access_packet(pkt):
    if pkt in cache:
        cache.remove(pkt)
        cache.append(pkt)
    else:
        if len(cache) >= 3:
            cache.pop(0)
        cache.append(pkt)

access_packet("PKT_4")
print(cache)`,
    language: 'python',
    difficulty: 'hard',
    expectedOutput: "['PKT_2', 'PKT_3', 'PKT_4']",
    filename: 'root@odyssey:/systems/lru_cache.py',
    memoryLimit: '128MB',
    timeLimit: '1000ms',
    seqId: '7D-IOTA',
    explanation: 'In an LRU queue where recent items are appended to the tail, the least recently used element is at index 0. Calling cache.pop() evicts the newest element at the end; changed to cache.pop(0).'
  },
  {
    id: 40,
    round: 3,
    questionNumber: 10,
    title: 'Alien Signal Longest Common Subsequence Length',
    category: 'Dynamic Programming',
    type: 'debugging',
    description: 'Compute the length of longest common subsequence between signals "ABCDE" and "ACE". Fix DP matrix initialization.',
    brokenCode: `def lcs(s1, s2):
    m, n = len(s1), len(s2)
    # Bug: shallow copy references identical rows!
    dp = [[0] * (n + 1)] * (m + 1)
    
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i-1] == s2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    return dp[m][n]

print(f"LCS Length: {lcs('ABCDE', 'ACE')}")`,
    expectedAnswer: `def lcs(s1, s2):
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i-1] == s2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    return dp[m][n]

print(f"LCS Length: {lcs('ABCDE', 'ACE')}")`,
    language: 'python',
    difficulty: 'hard',
    expectedOutput: 'LCS Length: 3',
    filename: 'root@odyssey:/systems/signal_lcs.py',
    memoryLimit: '128MB',
    timeLimit: '1000ms',
    seqId: '7D-KAPPA',
    explanation: 'Creating a 2D array via [[0]*(n+1)] * (m+1) duplicates references to the exact same inner list, causing updates in one row to modify all rows. Fixed using list comprehension [[0]*(n+1) for _ in range(m+1)].'
  },
  {
    id: 41,
    round: 3,
    questionNumber: 11,
    title: 'Gravity Assist Fuel Optimization',
    category: 'Greedy Algorithm',
    type: 'completion',
    description: 'Select minimal fuel cost step choices from option pairs [(5, 8), (12, 9), (7, 4)]. Return the total minimum fuel required.',
    brokenCode: `step_options = [(5, 8), (12, 9), (7, 4)]
total_min_fuel = 0
for opt1, opt2 in step_options:
    # Choose smaller value and accumulate
    pass
print(f"Min Fuel Required: {total_min_fuel} kg")`,
    expectedAnswer: `step_options = [(5, 8), (12, 9), (7, 4)]
total_min_fuel = sum(min(opt1, opt2) for opt1, opt2 in step_options)
print(f"Min Fuel Required: {total_min_fuel} kg")`,
    acceptedAnswers: [
      `step_options = [(5, 8), (12, 9), (7, 4)]\ntotal_min_fuel = 0\nfor opt1, opt2 in step_options:\n    total_min_fuel += min(opt1, opt2)\nprint(f"Min Fuel Required: {total_min_fuel} kg")`
    ],
    language: 'python',
    difficulty: 'hard',
    expectedOutput: 'Min Fuel Required: 18 kg',
    filename: 'root@odyssey:/systems/fuel_optim.py',
    memoryLimit: '128MB',
    timeLimit: '1000ms',
    seqId: '7D-LAMBDA',
    explanation: 'The greedy choice selects min(opt1, opt2) for every waypoint step: min(5,8)=5 + min(12,9)=9 + min(7,4)=4 = 18 kg total.'
  },
  {
    id: 42,
    round: 3,
    questionNumber: 12,
    title: 'Deep Space XOR Checksum Verifier',
    category: 'Bitwise Checksum',
    type: 'debugging',
    description: 'Calculate the XOR checksum of a telemetry byte sequence [0x41, 0x52, 0x4B]. Fix the bitwise operator.',
    brokenCode: `bytes_data = [0x41, 0x52, 0x4B]
checksum = 0
for b in bytes_data:
    # Bug: using addition instead of XOR
    checksum = checksum + b
print(f"Checksum: {hex(checksum)}")`,
    expectedAnswer: `bytes_data = [0x41, 0x52, 0x4B]
checksum = 0
for b in bytes_data:
    checksum = checksum ^ b
print(f"Checksum: {hex(checksum)}")`,
    language: 'python',
    difficulty: 'hard',
    expectedOutput: 'Checksum: 0x58',
    filename: 'root@odyssey:/systems/xor_checksum.py',
    memoryLimit: '128MB',
    timeLimit: '1000ms',
    seqId: '7D-MU',
    explanation: 'A bitwise XOR checksum requires using the "^" operator (0x41 ^ 0x52 ^ 0x4B = 0x58). The buggy code mistakenly used arithmetic addition "+".'
  },
  {
    id: 43,
    round: 3,
    questionNumber: 13,
    title: 'Vector Euclidean Distance Anomaly Detector',
    category: 'Math / Vectors',
    type: 'completion',
    description: 'Calculate the 3D Euclidean distance between the probe (10, 20, 30) and the gateway waypoint (14, 23, 42).',
    brokenCode: `import math

p1 = (10, 20, 30)
p2 = (14, 23, 42)

# Distance formula: sqrt((x2-x1)^2 + (y2-y1)^2 + (z2-z1)^2)
dist = 0.0
# TODO: calculate dist
print(f"Distance: {round(dist, 2)} km")`,
    expectedAnswer: `import math

p1 = (10, 20, 30)
p2 = (14, 23, 42)

dist = math.sqrt((p2[0]-p1[0])**2 + (p2[1]-p1[1])**2 + (p2[2]-p1[2])**2)
print(f"Distance: {round(dist, 2)} km")`,
    acceptedAnswers: [
      `import math\n\np1 = (10, 20, 30)\np2 = (14, 23, 42)\n\ndist = math.dist(p1, p2)\nprint(f"Distance: {round(dist, 2)} km")`
    ],
    language: 'python',
    difficulty: 'hard',
    expectedOutput: 'Distance: 13.0 km',
    filename: 'root@odyssey:/systems/vector_dist.py',
    memoryLimit: '128MB',
    timeLimit: '1000ms',
    seqId: '7D-NU',
    explanation: 'The 3D Euclidean distance is sqrt((14-10)^2 + (23-20)^2 + (42-30)^2) = sqrt(16 + 9 + 144) = sqrt(169) = 13.0 km.'
  },
  {
    id: 44,
    round: 3,
    questionNumber: 14,
    title: 'Fast Modular Exponentiation for Gateway Shield',
    category: 'Number Theory',
    type: 'debugging',
    description: 'Calculate (base^exp) % mod efficiently using built-in pow(base, exp, mod). Fix incorrect syntax.',
    brokenCode: `base = 7
exp = 13
mod = 19
# Calculate (7^13) % 19
result = pow(base, mod, exp) # Bug: arguments swapped!
print(f"Shield Key: {result}")`,
    expectedAnswer: `base = 7
exp = 13
mod = 19
result = pow(base, exp, mod)
print(f"Shield Key: {result}")`,
    language: 'python',
    difficulty: 'hard',
    expectedOutput: 'Shield Key: 11',
    filename: 'root@odyssey:/systems/modular_shield.py',
    memoryLimit: '128MB',
    timeLimit: '1000ms',
    seqId: '7D-XI',
    explanation: 'Python pow(base, exp, mod) takes the exponent second and modulus third. Swapping the arguments to pow(7, 13, 19) calculates (7**13) % 19 = 11.'
  },
  {
    id: 45,
    round: 3,
    questionNumber: 15,
    title: 'Final Gateway Docking Protocol Ignition',
    category: 'System Integration',
    type: 'logic',
    description: 'Final multi-check validation for Deep Space Gateway lock. All 4 subsystems must report READY before ignition.',
    brokenCode: `subsystems = {
    "quantum_core": "READY",
    "deflector_shield": "READY",
    "ion_drives": "STANDBY",  # Required to be READY
    "nav_computer": "READY"
}

def can_ignite(systems):
    # Bug: checks if ANY is ready instead of ALL
    return any(status == "READY" for status in systems.values())

print(f"Docking Ignition Authorized: {can_ignite(subsystems)}")`,
    expectedAnswer: `subsystems = {
    "quantum_core": "READY",
    "deflector_shield": "READY",
    "ion_drives": "READY",
    "nav_computer": "READY"
}

def can_ignite(systems):
    return all(status == "READY" for status in systems.values())

print(f"Docking Ignition Authorized: {can_ignite(subsystems)}")`,
    language: 'python',
    difficulty: 'hard',
    expectedOutput: 'Docking Ignition Authorized: True',
    filename: 'root@odyssey:/systems/final_ignition.py',
    memoryLimit: '128MB',
    timeLimit: '1000ms',
    seqId: '7D-OMEGA',
    explanation: 'Docking ignition requires all subsystems to be "READY". Changed "ion_drives" from "STANDBY" to "READY" and used all() rather than any().'
  }
];
