<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<template>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container-fluid px-5 py-2">
            <a class="navbar-brand" href="#">Pi Monitor</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item">
                        <RouterLink class="nav-link active" to="home">Dashboard</RouterLink>
                    </li>
                    <li class="nav-item">
                        <RouterLink class="nav-link" to="home">Network</RouterLink>
                    </li>
                    <li class="nav-item">
                        <RouterLink class="nav-link" to="home">Terminal</RouterLink>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
</template>