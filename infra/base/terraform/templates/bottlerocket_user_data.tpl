%{ if enable_soci_snapshotter ~}
[settings.container-runtime]
snapshotter = "soci"
[settings.container-runtime-plugins.soci-snapshotter]
pull-mode = "parallel-pull-unpack"
[settings.container-runtime-plugins.soci-snapshotter.parallel-pull-unpack]
max-concurrent-downloads-per-image = 20
concurrent-download-chunk-size = "16mb"
max-concurrent-unpacks-per-image = 10
discard-unpacked-layers = true
%{ endif ~}
%{ if max_user_namespaces > 0 ~}
[settings.kernel.sysctl]
"user.max_user_namespaces" = "${max_user_namespaces}"
%{ endif ~}
