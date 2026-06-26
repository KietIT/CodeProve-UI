/**
 * Single source of truth for training exercises.
 * Shared by the level picker (`/workspace/[level]`) and the solve workspace
 * (`/workspace/solve`). Replace the static `LEVELS` map with a fetch/DB call
 * later — the UI and helpers below stay unchanged.
 */

export type Difficulty = "Easy" | "Medium" | "Hard";
export type Status = "solved" | "attempted" | "todo" | "locked";

export type Exercise = {
  id: string;
  num: number;
  title: string;
  difficulty: Difficulty;
  acceptance: number;
  status: Status;
  topics: string[];
  // ── Workspace content ──
  summary: string;
  filename: string;
  language: "python" | "javascript";
  starter: string;
  hint: string;
  tests: string[];
};

export type LevelConfig = {
  slug: string;
  name: string;
  level: Difficulty;
  filled: number;
  blurb: string;
  exercises: Exercise[];
};

/** Topic filters mirror the assessment domains used across the app. */
export const TOPICS = ["All Topics", "Algorithms", "Debugging", "API security", "Concurrency"];

/** Scoring rubric is shared across all CodeProve exercises. */
export const RUBRIC: [string, string][] = [
  ["Understanding", "25%"],
  ["Hypothesis", "22%"],
  ["Prompting", "18%"],
  ["Verification", "15%"],
  ["Testing", "10%"],
  ["Debugging", "10%"],
];

export const PROMPT_SUGGESTIONS = [
  "Explain the time complexity",
  "What edge cases am I missing?",
  "Review my hypothesis",
  "Suggest a test case",
];

export const LEVELS: Record<string, LevelConfig> = {
  fresher: {
    slug: "fresher",
    name: "Fresher",
    level: "Easy",
    filled: 1,
    blurb: "Foundational problem-solving with AI guidance. Build core habits: read, hypothesise, prompt.",
    exercises: [
      {
        id: "CP-001", num: 1, title: "Two-Sum Variations", difficulty: "Easy", acceptance: 57.7, status: "solved", topics: ["Algorithms"],
        summary: "Given an array of integers and a target, return the indices of the two numbers that add up to the target. Explain your approach before and after writing code.",
        filename: "solution.py", language: "python",
        starter: `def two_sum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        if target - n in seen:
            return [seen[target - n], i]
        seen[n] = i
    return []`,
        hint: "Before you code — what's your hypothesis for reaching O(n)? A hash map lets you check the complement in constant time.",
        tests: ["test_basic_case", "test_duplicates", "test_no_solution", "test_negatives"],
      },
      {
        id: "CP-002", num: 2, title: "Reverse a Linked List", difficulty: "Easy", acceptance: 61.2, status: "solved", topics: ["Algorithms"],
        summary: "Reverse a singly linked list in place and return the new head. Walk through the pointer reassignment before coding.",
        filename: "solution.py", language: "python",
        starter: `def reverse_list(head):
    prev = None
    while head:
        nxt = head.next
        head.next = prev
        prev = head
        head = nxt
    return prev`,
        hint: "Can you reverse it without extra space? Track three pointers: prev, current, and next.",
        tests: ["test_empty", "test_single_node", "test_many_nodes"],
      },
      {
        id: "CP-003", num: 3, title: "Validate Palindrome", difficulty: "Easy", acceptance: 48.9, status: "attempted", topics: ["Algorithms"],
        summary: "Return True if a string is a palindrome, ignoring case and non-alphanumeric characters. State your two-pointer plan first.",
        filename: "solution.py", language: "python",
        starter: `def is_palindrome(s):
    cleaned = [c.lower() for c in s if c.isalnum()]
    return cleaned == cleaned[::-1]`,
        hint: "Two pointers from both ends can avoid building a second list. Which characters should you skip?",
        tests: ["test_simple", "test_mixed_case", "test_punctuation", "test_empty"],
      },
      {
        id: "CP-004", num: 4, title: "Fix the Off-By-One Loop", difficulty: "Easy", acceptance: 52.0, status: "todo", topics: ["Debugging"],
        summary: "The function should sum the first n integers but returns the wrong total. Find the off-by-one error and fix it.",
        filename: "solution.py", language: "python",
        starter: `def sum_to_n(n):
    total = 0
    for i in range(1, n):   # bug: never adds n itself
        total += i
    return total`,
        hint: "Trace the loop by hand with n = 3. Which value never gets added to the total?",
        tests: ["test_n_3", "test_n_1", "test_zero"],
      },
      {
        id: "CP-005", num: 5, title: "Sanitise User Input", difficulty: "Easy", acceptance: 44.1, status: "todo", topics: ["API security"],
        summary: "Strip dangerous characters from a username before it reaches the database layer. Explain what you are defending against.",
        filename: "validators.py", language: "python",
        starter: `import re

def sanitize_username(raw):
    raw = raw.strip()
    return re.sub(r"[^a-zA-Z0-9_]", "", raw)`,
        hint: "What injection class are you preventing here? Prefer an allow-list over a block-list.",
        tests: ["test_strips_html", "test_keeps_underscore", "test_trims_space"],
      },
      {
        id: "CP-006", num: 6, title: "Count Word Frequency", difficulty: "Easy", acceptance: 66.4, status: "todo", topics: ["Algorithms"],
        summary: "Return a dict mapping each word to its count, case-insensitive. Then explain what collections.Counter would do under the hood.",
        filename: "solution.py", language: "python",
        starter: `def word_count(text):
    counts = {}
    for word in text.lower().split():
        counts[word] = counts.get(word, 0) + 1
    return counts`,
        hint: "collections.Counter exists — but can you explain the dict-accumulation pattern it replaces?",
        tests: ["test_basic", "test_case_insensitive", "test_empty"],
      },
      {
        id: "CP-007", num: 7, title: "Merge Two Sorted Arrays", difficulty: "Medium", acceptance: 39.3, status: "todo", topics: ["Algorithms"],
        summary: "Merge two ascending arrays into one sorted array without calling the built-in sort. Justify your complexity.",
        filename: "solution.py", language: "python",
        starter: `def merge(a, b):
    i = j = 0
    out = []
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            out.append(a[i]); i += 1
        else:
            out.append(b[j]); j += 1
    return out + a[i:] + b[j:]`,
        hint: "Two pointers keep this O(n + m). Why is calling sort() on the concatenation a worse answer?",
        tests: ["test_equal_len", "test_one_empty", "test_interleaved"],
      },
      {
        id: "CP-008", num: 8, title: "Debug the Null Reference", difficulty: "Easy", acceptance: 50.7, status: "todo", topics: ["Debugging"],
        summary: "This function crashes when the user has no profile. Locate the null dereference and guard against it safely.",
        filename: "solution.py", language: "python",
        starter: `def display_name(user):
    # crashes when "profile" is missing
    return user["profile"]["name"]`,
        hint: "Which key is not guaranteed to exist? Reach for .get() or an early return.",
        tests: ["test_has_profile", "test_missing_profile", "test_missing_name"],
      },
      {
        id: "CP-009", num: 9, title: "Rate-Limit a Request Handler", difficulty: "Medium", acceptance: 31.1, status: "locked", topics: ["Concurrency", "API security"],
        summary: "Allow at most N requests per client per minute. Discuss the trade-offs of a fixed window vs a sliding window.",
        filename: "limiter.py", language: "python",
        starter: `def is_allowed(client_id, store, limit=60):
    count = store.get(client_id, 0)
    if count >= limit:
        return False
    store[client_id] = count + 1
    return True`,
        hint: "What happens right at the window boundary? Consider a sliding log or a token bucket.",
        tests: ["test_under_limit", "test_over_limit", "test_window_reset"],
      },
      {
        id: "CP-010", num: 10, title: "FizzBuzz, Explained", difficulty: "Easy", acceptance: 71.2, status: "todo", topics: ["Algorithms"],
        summary: "Return Fizz, Buzz, or FizzBuzz for 1..n. Then explain why the order of the conditionals matters.",
        filename: "solution.py", language: "python",
        starter: `def fizzbuzz(n):
    out = []
    for i in range(1, n + 1):
        if i % 15 == 0:
            out.append("FizzBuzz")
        elif i % 3 == 0:
            out.append("Fizz")
        elif i % 5 == 0:
            out.append("Buzz")
        else:
            out.append(str(i))
    return out`,
        hint: "Why must the % 15 check come first? Reorder it and predict what breaks.",
        tests: ["test_fizzbuzz", "test_fizz", "test_buzz", "test_plain"],
      },
      {
        id: "CP-011", num: 11, title: "Find the Duplicate", difficulty: "Easy", acceptance: 60.2, status: "todo", topics: ["Algorithms"],
        summary: "An array of n+1 integers in the range 1..n contains exactly one duplicate. Find it and discuss the space trade-off.",
        filename: "solution.py", language: "python",
        starter: `def find_duplicate(nums):
    seen = set()
    for n in nums:
        if n in seen:
            return n
        seen.add(n)
    return -1`,
        hint: "The set answer is O(n) space. Could Floyd's cycle detection get you to O(1)?",
        tests: ["test_basic", "test_dup_at_end", "test_min_size"],
      },
      {
        id: "CP-012", num: 12, title: "Trace the Race Condition", difficulty: "Medium", acceptance: 27.8, status: "locked", topics: ["Concurrency", "Debugging"],
        summary: "Two threads increment a shared counter and the total comes out wrong. Identify the race and make it safe.",
        filename: "solution.py", language: "python",
        starter: `counter = 0

def increment():
    global counter
    counter += 1   # read-modify-write is not atomic`,
        hint: "Why is += not atomic across threads? A lock or atomic primitive closes the gap.",
        tests: ["test_single_thread", "test_concurrent", "test_lock_held"],
      },
    ],
  },
  junior: {
    slug: "junior",
    name: "Junior",
    level: "Medium",
    filled: 2,
    blurb: "Intermediate logic and debugging. Verify AI output and explain your reasoning back.",
    exercises: [
      {
        id: "CP-101", num: 1, title: "LRU Cache Design", difficulty: "Medium", acceptance: 42.3, status: "solved", topics: ["Algorithms"],
        summary: "Implement an LRU cache with O(1) get and put. Describe your data-structure choice before writing code.",
        filename: "lru_cache.py", language: "python",
        starter: `from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.data = OrderedDict()

    def get(self, key):
        if key not in self.data:
            return -1
        self.data.move_to_end(key)
        return self.data[key]`,
        hint: "Why pair a hash map with a doubly linked list? What does move_to_end cost you?",
        tests: ["test_get_hit", "test_evict_lru", "test_update_existing"],
      },
      {
        id: "CP-102", num: 2, title: "Debug the Memory Leak", difficulty: "Medium", acceptance: 38.0, status: "attempted", topics: ["Debugging"],
        summary: "A cache grows without bound in production. Find why entries are never released and fix it.",
        filename: "solution.py", language: "python",
        starter: `_cache = {}

def memoize(key, compute):
    if key not in _cache:
        _cache[key] = compute()   # nothing ever evicts this
    return _cache[key]`,
        hint: "An unbounded dict is the leak. Add a max size or reach for functools.lru_cache.",
        tests: ["test_caches", "test_bounded_size", "test_eviction"],
      },
      {
        id: "CP-103", num: 3, title: "Validate a JWT Flow", difficulty: "Medium", acceptance: 35.5, status: "todo", topics: ["API security"],
        summary: "Verify a JWT's signature and expiry before trusting any claims. Note what must never be skipped.",
        filename: "auth.py", language: "python",
        starter: `import jwt

def verify_token(token, secret):
    try:
        return jwt.decode(token, secret, algorithms=["HS256"])
    except jwt.InvalidTokenError:
        return None`,
        hint: "Why pin the algorithm explicitly? What attack does accepting 'alg: none' open up?",
        tests: ["test_valid", "test_expired", "test_bad_signature", "test_alg_none"],
      },
      {
        id: "CP-104", num: 4, title: "Producer–Consumer Queue", difficulty: "Medium", acceptance: 33.7, status: "todo", topics: ["Concurrency"],
        summary: "Coordinate producers and consumers over a bounded queue without busy-waiting.",
        filename: "solution.py", language: "python",
        starter: `from queue import Queue
from threading import Thread

def consumer(q):
    while True:
        item = q.get()
        process(item)
        q.task_done()`,
        hint: "How does a blocking queue replace your while-True polling? What signals that work is done?",
        tests: ["test_single", "test_many_items", "test_graceful_stop"],
      },
      {
        id: "CP-105", num: 5, title: "Longest Substring No Repeat", difficulty: "Medium", acceptance: 39.3, status: "todo", topics: ["Algorithms"],
        summary: "Return the length of the longest substring without repeating characters. Explain the window invariant.",
        filename: "solution.py", language: "python",
        starter: `def length_of_longest(s):
    seen = {}
    start = best = 0
    for i, c in enumerate(s):
        if c in seen and seen[c] >= start:
            start = seen[c] + 1
        seen[c] = i
        best = max(best, i - start + 1)
    return best`,
        hint: "A sliding window with a last-seen map keeps this O(n). When exactly do you move 'start'?",
        tests: ["test_basic", "test_all_same", "test_empty"],
      },
      {
        id: "CP-106", num: 6, title: "Patch the SQL Injection", difficulty: "Medium", acceptance: 41.8, status: "todo", topics: ["API security", "Debugging"],
        summary: "This query concatenates user input directly. Rewrite it to be injection-safe and explain the fix.",
        filename: "queries.py", language: "python",
        starter: `def find_user(db, name):
    # vulnerable: string concatenation
    return db.execute(
        "SELECT * FROM users WHERE name = '" + name + "'"
    )`,
        hint: "Parameterised queries separate code from data. Why isn't manual escaping enough on its own?",
        tests: ["test_normal_name", "test_quote_in_name", "test_injection_blocked"],
      },
      {
        id: "CP-107", num: 7, title: "Detect Cycle in Graph", difficulty: "Medium", acceptance: 46.8, status: "todo", topics: ["Algorithms"],
        summary: "Return True if a directed graph contains a cycle. Choose and justify a traversal strategy.",
        filename: "solution.py", language: "python",
        starter: `def has_cycle(graph):
    state = {}  # 0 = visiting, 1 = done

    def dfs(node):
        if state.get(node) == 0:
            return True
        if state.get(node) == 1:
            return False
        state[node] = 0
        if any(dfs(n) for n in graph[node]):
            return True
        state[node] = 1
        return False

    return any(dfs(n) for n in graph)`,
        hint: "Why do you need three states, not just visited/unvisited? What is a back edge?",
        tests: ["test_acyclic", "test_self_loop", "test_back_edge"],
      },
      {
        id: "CP-108", num: 8, title: "Thread-Safe Counter", difficulty: "Hard", acceptance: 29.4, status: "locked", topics: ["Concurrency"],
        summary: "Build a counter that stays correct under heavy concurrent increments.",
        filename: "solution.py", language: "python",
        starter: `from threading import Lock

class Counter:
    def __init__(self):
        self._n = 0
        self._lock = Lock()`,
        hint: "Where exactly must the lock be held? Keep the critical section as small as possible.",
        tests: ["test_serial", "test_parallel", "test_value_exact"],
      },
      {
        id: "CP-109", num: 9, title: "Reconstruct the Stack Trace", difficulty: "Medium", acceptance: 37.1, status: "todo", topics: ["Debugging"],
        summary: "An exception is swallowed and re-raised without context. Restore a useful, chained trace.",
        filename: "solution.py", language: "python",
        starter: `def load(path):
    try:
        return open(path).read()
    except Exception:
        raise RuntimeError("load failed")   # original cause is lost`,
        hint: "What does 'raise ... from e' preserve that a bare re-raise throws away?",
        tests: ["test_success", "test_missing_file", "test_chained_cause"],
      },
      {
        id: "CP-110", num: 10, title: "Sliding Window Maximum", difficulty: "Hard", acceptance: 24.6, status: "locked", topics: ["Algorithms"],
        summary: "Return the maximum of every window of size k. Aim for O(n) overall.",
        filename: "solution.py", language: "python",
        starter: `from collections import deque

def max_sliding_window(nums, k):
    dq, out = deque(), []
    for i, n in enumerate(nums):
        while dq and nums[dq[-1]] < n:
            dq.pop()
        dq.append(i)
        if dq[0] <= i - k:
            dq.popleft()
        if i >= k - 1:
            out.append(nums[dq[0]])
    return out`,
        hint: "Why a monotonic deque of indices instead of recomputing the max for each window?",
        tests: ["test_basic", "test_k_1", "test_decreasing"],
      },
    ],
  },
  senior: {
    slug: "senior",
    name: "Senior",
    level: "Hard",
    filled: 3,
    blurb: "Advanced architecture and edge-case reasoning. High-stakes verification and testing.",
    exercises: [
      {
        id: "CP-201", num: 1, title: "Distributed Rate Limiter", difficulty: "Hard", acceptance: 22.4, status: "attempted", topics: ["Concurrency", "API security"],
        summary: "Design a rate limiter that holds across multiple app servers. Discuss the consistency vs latency trade-off.",
        filename: "limiter.py", language: "python",
        starter: `def is_allowed(redis, key, limit, window):
    count = redis.incr(key)
    if count == 1:
        redis.expire(key, window)
    return count <= limit`,
        hint: "Why centralise state in Redis? What race exists between INCR and EXPIRE, and how do you close it?",
        tests: ["test_first_request", "test_over_limit", "test_window_expiry"],
      },
      {
        id: "CP-202", num: 2, title: "Median of Two Sorted Arrays", difficulty: "Hard", acceptance: 46.8, status: "todo", topics: ["Algorithms"],
        summary: "Find the median of two sorted arrays in O(log(m+n)). Explain the partition invariant before coding.",
        filename: "solution.py", language: "python",
        starter: `def find_median(a, b):
    if len(a) > len(b):
        a, b = b, a
    # binary-search the partition on the shorter array
    lo, hi = 0, len(a)
    ...`,
        hint: "The trick is binary-searching the partition, not merging. What invariant defines a correct cut?",
        tests: ["test_even_total", "test_odd_total", "test_one_empty"],
      },
      {
        id: "CP-203", num: 3, title: "Audit the Auth Middleware", difficulty: "Hard", acceptance: 28.1, status: "todo", topics: ["API security", "Debugging"],
        summary: "A middleware lets some unauthenticated requests through. Find the logic gap and close it.",
        filename: "middleware.py", language: "python",
        starter: `def require_auth(request, handler):
    token = request.headers.get("Authorization")
    if token:                      # bug: present != valid
        return handler(request)
    return deny()`,
        hint: "A present token is not a valid token. What must you verify before calling the handler?",
        tests: ["test_valid_token", "test_missing_token", "test_invalid_token"],
      },
      {
        id: "CP-204", num: 4, title: "Lock-Free Ring Buffer", difficulty: "Hard", acceptance: 19.7, status: "locked", topics: ["Concurrency"],
        summary: "Implement a single-producer single-consumer ring buffer without locks.",
        filename: "solution.py", language: "python",
        starter: `class RingBuffer:
    def __init__(self, size):
        self.buf = [None] * size
        self.head = 0
        self.tail = 0`,
        hint: "With one producer and one consumer, which index does each side own exclusively?",
        tests: ["test_push_pop", "test_full", "test_wrap_around"],
      },
      {
        id: "CP-205", num: 5, title: "Regular Expression Matching", difficulty: "Hard", acceptance: 31.1, status: "todo", topics: ["Algorithms"],
        summary: "Implement '.' and '*' matching against an input string. Explain your DP state definition.",
        filename: "solution.py", language: "python",
        starter: `def is_match(s, p):
    memo = {}

    def dp(i, j):
        if (i, j) in memo:
            return memo[(i, j)]
        ...`,
        hint: "What do the indices (i, j) represent? Handle '*' as zero-or-more of the preceding char.",
        tests: ["test_literal", "test_dot", "test_star", "test_complex"],
      },
      {
        id: "CP-206", num: 6, title: "Diagnose the Deadlock", difficulty: "Hard", acceptance: 23.3, status: "locked", topics: ["Concurrency", "Debugging"],
        summary: "Two threads each hold one lock and wait for the other. Break the deadlock without losing safety.",
        filename: "solution.py", language: "python",
        starter: `def transfer(a, b, amount):
    with a.lock:
        with b.lock:   # reversed order elsewhere -> deadlock
            a.balance -= amount
            b.balance += amount`,
        hint: "Consistent lock ordering prevents the cycle. How can you order two arbitrary accounts deterministically?",
        tests: ["test_single_transfer", "test_concurrent_opposite", "test_no_deadlock"],
      },
      {
        id: "CP-207", num: 7, title: "Serialize a Binary Tree", difficulty: "Hard", acceptance: 35.0, status: "todo", topics: ["Algorithms"],
        summary: "Serialize a binary tree to a string and deserialize it back, preserving structure exactly.",
        filename: "solution.py", language: "python",
        starter: `def serialize(root):
    out = []
    def dfs(node):
        if not node:
            out.append("#"); return
        out.append(str(node.val))
        dfs(node.left); dfs(node.right)
    dfs(root)
    return ",".join(out)`,
        hint: "How do null markers let a preorder walk alone rebuild the tree unambiguously?",
        tests: ["test_roundtrip", "test_single", "test_empty", "test_skewed"],
      },
      {
        id: "CP-208", num: 8, title: "Harden the Upload Endpoint", difficulty: "Hard", acceptance: 26.2, status: "locked", topics: ["API security"],
        summary: "An upload handler trusts the client's filename and content-type. List the risks and fix them.",
        filename: "upload.py", language: "python",
        starter: `def save_upload(file):
    # trusts client-provided name and type
    path = "/uploads/" + file.filename
    open(path, "wb").write(file.read())`,
        hint: "Path traversal, type spoofing, size limits — which risk do you close first, and why?",
        tests: ["test_safe_name", "test_path_traversal_blocked", "test_size_limit"],
      },
    ],
  },
};

export const LEVEL_LIST = Object.values(LEVELS);

export function getLevel(slug: string | undefined): LevelConfig | undefined {
  return slug ? LEVELS[slug.toLowerCase()] : undefined;
}

/** Look up an exercise by id, returning it together with its owning level. */
export function getExercise(id: string | undefined): { exercise: Exercise; level: LevelConfig } | undefined {
  if (!id) return undefined;
  const wanted = id.toUpperCase();
  for (const level of LEVEL_LIST) {
    const exercise = level.exercises.find((e) => e.id.toUpperCase() === wanted);
    if (exercise) return { exercise, level };
  }
  return undefined;
}

// ── Lightweight syntax highlighting ─────────────────────────────────────────
export type CodeToken = { t: string; c?: "kw" | "fn" | "com" };

const KEYWORDS: Record<string, string[]> = {
  python: ["def", "return", "for", "in", "if", "elif", "else", "while", "class", "import", "from", "as", "with", "try", "except", "raise", "lambda", "and", "or", "not", "None", "True", "False", "pass", "yield", "global", "async", "await", "is"],
  javascript: ["function", "return", "for", "in", "of", "if", "else", "while", "const", "let", "var", "class", "new", "import", "from", "export", "try", "catch", "throw", "async", "await", "null", "true", "false", "typeof", "this"],
};

/** Tokenise a single line for keyword/function-name colouring (no string parsing). */
export function tokenizeLine(line: string, language: string): CodeToken[] {
  const keywords = new Set(KEYWORDS[language] ?? KEYWORDS.python);
  const commentMark = language === "javascript" ? "//" : "#";

  let code = line;
  let comment = "";
  const idx = code.indexOf(commentMark);
  if (idx >= 0) {
    comment = code.slice(idx);
    code = code.slice(0, idx);
  }

  const tokens: CodeToken[] = [];
  const parts = code.match(/(\w+|\s+|[^\w\s]+)/g) ?? [];
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (/^[A-Za-z_]\w*$/.test(part)) {
      if (keywords.has(part)) tokens.push({ t: part, c: "kw" });
      else if ((parts[i + 1] ?? "").startsWith("(")) tokens.push({ t: part, c: "fn" });
      else tokens.push({ t: part });
    } else {
      tokens.push({ t: part });
    }
  }
  if (comment) tokens.push({ t: comment, c: "com" });
  return tokens;
}
