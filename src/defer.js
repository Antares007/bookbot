//@flow strict
let list = []

function run() {
  const list_ = list
  list = []
  for (var act of list_) act()
}

export function defer(action: () => void) {
  if (list.length === 0) Promise.resolve().then(run)
  list.push(action)
}
