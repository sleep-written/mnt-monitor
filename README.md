# @bleed-believer/mechty-fstab
A filesystem mount watchdog daemon for Linux, powered by `findmnt` and `systemd`.

## Requirements
- Linux
- Node.js >= 22
- `findmnt` (usually pre-installed, part of `util-linux`)
- `mount` / `umount`

## Installation
```bash
npm install -g @bleed-believer/mechty-fstab
```

## Usage
### Setup
Configure which filesystems to watch and manage the systemd service:

```bash
mechty-fstab setup
# or
mechty setup
```

From the setup menu you can:
- Toggle which fstab entrypoints are added to the watchlist
- Install or uninstall the systemd service (user or system depending on uid)

### Daemon
Run the watchdog manually (without systemd):

```bash
mechty-fstab daemon
# or
mechty daemon
```

Polls every second and remounts any watched filesystem that goes down.

## Data location
| Context | Path |
|---|---|
| Regular user | `~/.local/share/mechty-fstab/settings.db` |
| Root | `/var/lib/mechty-fstab/settings.db` |

## Service location
| Context | Path |
|---|---|
| Regular user | `~/.config/systemd/user/mechty-fstab.service` |
| Root | `/etc/systemd/system/mechty-fstab.service` |

> ⚠️ If executed as root, the tool displays a `[[ RUNNING AS ROOT ]]`
> warning. In this mode the service installs system-wide and the DB
> is stored in `/var/lib/`.

## License
MIT