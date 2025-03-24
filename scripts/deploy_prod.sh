#!/bin/bash

# Leyendo argumentos
env=""
action=""
while getopts "e:a:" opt; do
  case $opt in
    e)
      env=$OPTARG
      ;;
    a)
      action=$OPTARG
      ;;
    *)
      echo "Invalid flag '$0'"
      exit 1
      ;;
  esac
done

# Validando argumentos
if [[ -z $env ]]; then
  echo "Include -e (dev, prod)."
  exit 1
fi
if [[ -z $action ]]; then
  echo "Include -a (create, down, start, stop)."
  exit 1
fi

app_name="virtual_class"
# Realizando acción
case $action in
  create)
    docker-compose -p "${app_name}_$env" --env-file ".env.$env" --env-file ".env.infra.$env" --profile "$env" up --build -d
    ;;
  down)
    docker-compose -p "${app_name}_$env" --env-file ".env.$env" --env-file ".env.infra.$env" --profile "$env" down
    ;;
  start)
    docker-compose -p "${app_name}_$env" --env-file ".env.$env" --env-file ".env.infra.$env" --profile "$env" up -d
    ;;
  stop)
    docker-compose -p "${app_name}_$env" --env-file ".env.$env" --env-file ".env.infra.$env" --profile "$env" stop
    ;;
  *)
    echo "Action not supported.";
    exit 1
    ;;
esac